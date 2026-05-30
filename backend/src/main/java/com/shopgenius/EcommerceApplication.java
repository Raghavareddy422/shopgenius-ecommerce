package com.shopgenius;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import com.shopgenius.user.entity.Role;
import com.shopgenius.user.repository.RoleRepository;
import com.shopgenius.user.entity.User;
import com.shopgenius.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.shopgenius.category.entity.Category;
import com.shopgenius.category.repository.CategoryRepository;
import com.shopgenius.product.entity.Product;
import com.shopgenius.product.repository.ProductRepository;
import com.shopgenius.cart.entity.Coupon;
import com.shopgenius.cart.repository.CouponRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@SpringBootApplication(exclude = {
    RedisAutoConfiguration.class,
    RedisRepositoriesAutoConfiguration.class
})
public class EcommerceApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcommerceApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedData(
            RoleRepository roleRepository,
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            CouponRepository couponRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Roles if empty
            if (roleRepository.count() == 0) {
                roleRepository.save(Role.builder().name("ROLE_USER").build());
                roleRepository.save(Role.builder().name("ROLE_ADMIN").build());
            }

            // Seed Admin User if not exists
            if (!userRepository.existsByEmail("admin@shopgenius.com")) {
                Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElse(null);
                Role userRole = roleRepository.findByName("ROLE_USER").orElse(null);

                User admin = User.builder()
                        .firstName("Admin")
                        .lastName("User")
                        .email("admin@shopgenius.com")
                        .password(passwordEncoder.encode("admin123"))
                        .phoneNumber("1234567890")
                        .roles(java.util.Set.of(adminRole, userRole))
                        .isActive(true)
                        .build();
                userRepository.save(admin);
            }

            // Seed Category if empty
            if (categoryRepository.count() == 0) {
                categoryRepository.save(Category.builder()
                        .name("Electronics")
                        .description("Premium gadgets and electronic devices")
                        .build());
                categoryRepository.save(Category.builder()
                        .name("Wearables")
                        .description("Smart and stylish wearable accessories")
                        .build());
                categoryRepository.save(Category.builder()
                        .name("Clothing & Apparel")
                        .description("High-quality sustainable clothing and activewear")
                        .build());
            }

            // Seed Products if empty
            if (productRepository.count() == 0) {
                Category electronics = categoryRepository.findByName("Electronics").orElse(null);
                Category wearables = categoryRepository.findByName("Wearables").orElse(null);
                Category clothing = categoryRepository.findByName("Clothing & Apparel").orElse(null);

                productRepository.save(Product.builder()
                        .sku("ECO-WATCH-01")
                        .name("EcoSmart Watch Pro")
                        .description("Sleek smartwatch crafted with 100% recycled aluminum. Features fitness tracking, smart notifications, and up to 7 days battery.")
                        .price(BigDecimal.valueOf(15999.00))
                        .costPrice(BigDecimal.valueOf(10000.00))
                        .stockQuantity(100)
                        .category(wearables)
                        .imageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80")
                        .ecoScore(92)
                        .build());

                productRepository.save(Product.builder()
                        .sku("HP-NOISE-02")
                        .name("Acoustix ANC Headphones")
                        .description("High-fidelity active noise cancelling headphones with hybrid drivers and memory foam cups.")
                        .price(BigDecimal.valueOf(24999.00))
                        .costPrice(BigDecimal.valueOf(16000.00))
                        .stockQuantity(50)
                        .category(electronics)
                        .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80")
                        .ecoScore(78)
                        .build());

                productRepository.save(Product.builder()
                        .sku("CHG-DOCK-03")
                        .name("Volt Wireless Charging Dock")
                        .description("Elegant multi-device charging dock with smart power allocation.")
                        .price(BigDecimal.valueOf(4999.00))
                        .costPrice(BigDecimal.valueOf(3000.00))
                        .stockQuantity(200)
                        .category(electronics)
                        .imageUrl("https://images.unsplash.com/photo-1622445262465-2481c4574875?w=500&auto=format&fit=crop&q=80")
                        .ecoScore(85)
                        .build());

                productRepository.save(Product.builder()
                        .sku("STAND-LAP-04")
                        .name("Bamboo Ergonomic Laptop Stand")
                        .description("Eco-friendly laptop stand made from organic bamboo.")
                        .price(BigDecimal.valueOf(3999.00))
                        .costPrice(BigDecimal.valueOf(2400.00))
                        .stockQuantity(150)
                        .category(wearables)
                        .imageUrl("https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80")
                        .ecoScore(98)
                        .build());

                productRepository.save(Product.builder()
                        .sku("CLO-TSHIRT-05")
                        .name("Organic Cotton T-Shirt")
                        .description("Premium lightweight tee made of 100% organic cotton. Super breathable and comfortable.")
                        .price(BigDecimal.valueOf(1299.00))
                        .costPrice(BigDecimal.valueOf(600.00))
                        .stockQuantity(150)
                        .category(clothing)
                        .imageUrl("https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80")
                        .ecoScore(95)
                        .sizes("S,M,L,XL")
                        .build());

                productRepository.save(Product.builder()
                        .sku("CLO-JACKET-06")
                        .name("Classic Denim Jacket")
                        .description("Heavyweight durable jacket made with recycled denim fibers. A timeless classic design.")
                        .price(BigDecimal.valueOf(4999.00))
                        .costPrice(BigDecimal.valueOf(2800.00))
                        .stockQuantity(80)
                        .category(clothing)
                        .imageUrl("https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=80")
                        .ecoScore(90)
                        .sizes("M,L,XL")
                        .build());
            }

            // Seed Coupons if empty
            if (couponRepository.count() == 0) {
                couponRepository.save(Coupon.builder()
                        .code("WELCOME10")
                        .discountPercentage(BigDecimal.valueOf(10.00))
                        .expiryDate(LocalDateTime.now().plusYears(5))
                        .isActive(true)
                        .build());
                couponRepository.save(Coupon.builder()
                        .code("SAVE4000")
                        .discountAmount(BigDecimal.valueOf(4000.00))
                        .minOrderAmount(BigDecimal.valueOf(15000.00))
                        .expiryDate(LocalDateTime.now().plusYears(5))
                        .isActive(true)
                        .build());
                couponRepository.save(Coupon.builder()
                        .code("RECOVERY15")
                        .discountPercentage(BigDecimal.valueOf(15.00))
                        .expiryDate(LocalDateTime.now().plusYears(5))
                        .isActive(true)
                        .build());
            }
        };
    }
}
