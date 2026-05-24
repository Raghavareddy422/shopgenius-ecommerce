package com.shopgenius.category.service;

import com.shopgenius.category.dto.CategoryCreateDto;
import com.shopgenius.category.dto.CategoryDto;
import com.shopgenius.category.entity.Category;
import com.shopgenius.category.mapper.CategoryMapper;
import com.shopgenius.category.repository.CategoryRepository;
import com.shopgenius.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Transactional
    public CategoryDto createCategory(CategoryCreateDto dto) {
        if (categoryRepository.existsByName(dto.getName())) {
            throw new BusinessException("Category with this name already exists", HttpStatus.BAD_REQUEST);
        }

        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());

        if (dto.getParentId() != null) {
            Category parent = categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new BusinessException("Parent category not found", HttpStatus.NOT_FOUND));
            category.setParent(parent);
        }

        category = categoryRepository.save(category);
        return categoryMapper.toDto(category);
    }

    public Page<CategoryDto> getAllCategories(Pageable pageable) {
        return categoryRepository.findAll(pageable)
                .map(categoryMapper::toDto);
    }

    public CategoryDto getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Category not found", HttpStatus.NOT_FOUND));
        return categoryMapper.toDto(category);
    }

    @Transactional
    public CategoryDto updateCategory(UUID id, CategoryCreateDto dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Category not found", HttpStatus.NOT_FOUND));

        if (!category.getName().equals(dto.getName()) && categoryRepository.existsByName(dto.getName())) {
            throw new BusinessException("Category with this name already exists", HttpStatus.BAD_REQUEST);
        }

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());

        if (dto.getParentId() != null) {
            Category parent = categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new BusinessException("Parent category not found", HttpStatus.NOT_FOUND));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        return categoryMapper.toDto(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(UUID id) {
        if (!categoryRepository.existsById(id)) {
            throw new BusinessException("Category not found", HttpStatus.NOT_FOUND);
        }
        categoryRepository.deleteById(id);
    }
}
