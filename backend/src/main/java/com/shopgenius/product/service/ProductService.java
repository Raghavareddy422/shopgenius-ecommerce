package com.shopgenius.product.service;

import com.shopgenius.category.entity.Category;
import com.shopgenius.category.repository.CategoryRepository;
import com.shopgenius.exception.BusinessException;
import com.shopgenius.product.dto.ProductCreateDto;
import com.shopgenius.product.dto.ProductDto;
import com.shopgenius.product.entity.Product;
import com.shopgenius.product.mapper.ProductMapper;
import com.shopgenius.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.shopgenius.product.repository.PriceWatchRepository;
import com.shopgenius.notification.service.NotificationService;
import java.math.BigDecimal;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;
    private final PriceWatchRepository priceWatchRepository;
    private final NotificationService notificationService;

    @Transactional
    public ProductDto createProduct(ProductCreateDto dto) {
        if (productRepository.existsBySku(dto.getSku())) {
            throw new BusinessException("Product with this SKU already exists", HttpStatus.BAD_REQUEST);
        }

        Product product = new Product();
        product.setSku(dto.getSku());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setCostPrice(dto.getCostPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setImageUrl(dto.getImageUrl());
        product.setEcoScore(dto.getEcoScore());
        product.setSizes(dto.getSizes());

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new BusinessException("Category not found", HttpStatus.NOT_FOUND));
            product.setCategory(category);
        }

        product = productRepository.save(product);
        return productMapper.toDto(product);
    }

    public Page<ProductDto> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(productMapper::toDto);
    }

    public Page<ProductDto> searchProductsByName(String name, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCase(name, pageable)
                .map(productMapper::toDto);
    }

    public Page<ProductDto> getProductsByCategory(UUID categoryId, Pageable pageable) {
        return productRepository.findByCategoryId(categoryId, pageable)
                .map(productMapper::toDto);
    }

    public ProductDto getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Product not found", HttpStatus.NOT_FOUND));
        return productMapper.toDto(product);
    }

    @Transactional
    public ProductDto updateProduct(UUID id, ProductCreateDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Product not found", HttpStatus.NOT_FOUND));

        if (!product.getSku().equals(dto.getSku()) && productRepository.existsBySku(dto.getSku())) {
            throw new BusinessException("Product with this SKU already exists", HttpStatus.BAD_REQUEST);
        }

        BigDecimal oldPrice = product.getPrice();
        BigDecimal newPrice = dto.getPrice();

        product.setSku(dto.getSku());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(newPrice);
        product.setCostPrice(dto.getCostPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setImageUrl(dto.getImageUrl());
        product.setEcoScore(dto.getEcoScore());
        product.setSizes(dto.getSizes());

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new BusinessException("Category not found", HttpStatus.NOT_FOUND));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        Product savedProduct = productRepository.save(product);

        if (newPrice.compareTo(oldPrice) < 0) {
            java.util.List<com.shopgenius.product.entity.PriceWatch> activeAlerts = priceWatchRepository.findByProductIdAndIsActive(savedProduct.getId(), true);
            for (com.shopgenius.product.entity.PriceWatch alert : activeAlerts) {
                if (alert.getTargetPrice().compareTo(newPrice) >= 0) {
                    notificationService.createNotification(alert.getUser(), "Price Drop Alert", 
                        String.format("Good news! The price of %s has dropped to ₹%s. (Your target price was ₹%s)", 
                            savedProduct.getName(), newPrice.setScale(2, java.math.RoundingMode.HALF_UP), alert.getTargetPrice().setScale(2, java.math.RoundingMode.HALF_UP)));
                    alert.setActive(false);
                    priceWatchRepository.save(alert);
                }
            }
        }

        return productMapper.toDto(savedProduct);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        if (!productRepository.existsById(id)) {
            throw new BusinessException("Product not found", HttpStatus.NOT_FOUND);
        }
        productRepository.deleteById(id);
    }
}
