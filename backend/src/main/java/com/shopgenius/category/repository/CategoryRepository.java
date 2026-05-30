package com.shopgenius.category.repository;

import com.shopgenius.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    boolean existsByName(String name);
    java.util.Optional<Category> findByName(String name);
}
