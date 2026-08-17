package com.example.demo.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private static final long MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

    private static final Set<String> BLOCKED_EXTENSIONS = new HashSet<>(Arrays.asList(
            "exe", "bat", "cmd", "sh", "php", "php3", "phtml", "jsp", "asp", "aspx", "dll", "scr", "vbs", "jar"
    ));

    public FileStorageService(@Value("${app.upload.dir:uploads/attachments}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not create upload directory: " + ex.getMessage());
        }
    }

    public StoredFileInfo storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot upload empty file");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File size exceeds limit of 15MB");
        }

        String rawOriginalFilename = file.getOriginalFilename();
        if (rawOriginalFilename == null || rawOriginalFilename.isBlank()) {
            rawOriginalFilename = "attachment_" + System.currentTimeMillis();
        }

        String cleanedOriginalFilename = StringUtils.cleanPath(rawOriginalFilename);

        // Prevent path traversal
        if (cleanedOriginalFilename.contains("..") || cleanedOriginalFilename.contains("/") || cleanedOriginalFilename.contains("\\")) {
            cleanedOriginalFilename = Paths.get(cleanedOriginalFilename).getFileName().toString();
        }

        // Sanitize characters
        cleanedOriginalFilename = cleanedOriginalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");

        // Validate extension
        String extension = getFileExtension(cleanedOriginalFilename).toLowerCase();
        if (BLOCKED_EXTENSIONS.contains(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File extension '." + extension + "' is not permitted");
        }

        String uniqueFileName = UUID.randomUUID().toString() + "_" + cleanedOriginalFilename;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName).normalize();
            if (!targetLocation.startsWith(this.fileStorageLocation)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            String fileUrl = "/api/attachments/file/" + uniqueFileName;
            String contentType = file.getContentType();
            if (contentType == null || contentType.isBlank()) {
                contentType = determineContentType(extension);
            }

            return new StoredFileInfo(cleanedOriginalFilename, uniqueFileName, fileUrl, contentType, file.getSize());
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store file: " + ex.getMessage());
        }
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file access path");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found or cannot be read: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found: " + fileName);
        }
    }

    public void deleteFile(String fileName) {
        if (fileName == null || fileName.isBlank()) return;
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            if (filePath.startsWith(this.fileStorageLocation)) {
                Files.deleteIfExists(filePath);
            }
        } catch (IOException ex) {
            // Log & continue — do not block DB deletion
            System.err.println("Warning: failed to delete file from disk: " + fileName + " (" + ex.getMessage() + ")");
        }
    }

    public static String extractStoredFileName(String fileUrl) {
        if (fileUrl == null) return null;
        int lastSlash = fileUrl.lastIndexOf('/');
        return lastSlash >= 0 ? fileUrl.substring(lastSlash + 1) : fileUrl;
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return dotIndex > 0 && dotIndex < filename.length() - 1 ? filename.substring(dotIndex + 1) : "";
    }

    private String determineContentType(String extension) {
        return switch (extension) {
            case "png" -> "image/png";
            case "jpg", "jpeg" -> "image/jpeg";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            case "svg" -> "image/svg+xml";
            case "pdf" -> "application/pdf";
            case "txt", "md" -> "text/plain";
            case "cpp", "c", "h" -> "text/x-c";
            case "java" -> "text/x-java-source";
            case "py" -> "text/x-python";
            case "zip" -> "application/zip";
            case "json" -> "application/json";
            default -> "application/octet-stream";
        };
    }

    public static class StoredFileInfo {
        private final String originalFilename;
        private final String storedFilename;
        private final String fileUrl;
        private final String contentType;
        private final long size;

        public StoredFileInfo(String originalFilename, String storedFilename, String fileUrl, String contentType, long size) {
            this.originalFilename = originalFilename;
            this.storedFilename = storedFilename;
            this.fileUrl = fileUrl;
            this.contentType = contentType;
            this.size = size;
        }

        public String getOriginalFilename() {
            return originalFilename;
        }

        public String getStoredFilename() {
            return storedFilename;
        }

        public String getFileUrl() {
            return fileUrl;
        }

        public String getContentType() {
            return contentType;
        }

        public long getSize() {
            return size;
        }
    }
}
