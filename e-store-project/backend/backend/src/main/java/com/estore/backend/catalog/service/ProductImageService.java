package com.estore.backend.catalog.service;

import java.io.ByteArrayInputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

@Service
public class ProductImageService {

    // Keep this conservative. You can increase it if you need larger images.
    private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;

    private final GridFsTemplate gridFsTemplate;
    private final GridFSBucket gridFsBucket;
    private final RestTemplate restTemplate;

    public record StoredImage(
            String fileId,
            @Nullable String contentType,
            @Nullable String filename,
            long size
    ) {}

    public ProductImageService(GridFsTemplate gridFsTemplate, GridFSBucket gridFsBucket) {
        this.gridFsTemplate = gridFsTemplate;
        this.gridFsBucket = gridFsBucket;
        this.restTemplate = new RestTemplate();
    }

    public StoredImage store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }
        if (file.getSize() > MAX_IMAGE_BYTES) {
            throw new IllegalArgumentException("Image is too large (max " + MAX_IMAGE_BYTES + " bytes)");
        }

        String filename = StringUtils.hasText(file.getOriginalFilename()) ? file.getOriginalFilename() : "product-image";
        String contentType = file.getContentType();
        if (StringUtils.hasText(contentType) && !contentType.toLowerCase().startsWith("image/")) {
            throw new IllegalArgumentException("Invalid content type: " + contentType);
        }

        try {
            ObjectId id = gridFsTemplate.store(file.getInputStream(), filename, contentType);
            return new StoredImage(id.toHexString(), contentType, filename, file.getSize());
        } catch (Exception e) {
            throw new RuntimeException("Failed to store image", e);
        }
    }

    public StoredImage storeFromUrl(String imageUrl) {
        if (!StringUtils.hasText(imageUrl)) {
            throw new IllegalArgumentException("Image URL is required");
        }

        URI uri;
        try {
            uri = URI.create(imageUrl.trim());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid image URL");
        }

        ResponseEntity<byte[]> resp;
        try {
            resp = restTemplate.getForEntity(uri, byte[].class);
        } catch (RestClientException e) {
            throw new IllegalArgumentException("Failed to download image from URL");
        }

        byte[] body = Optional.ofNullable(resp.getBody()).orElse(new byte[0]);
        if (body.length == 0) {
            throw new IllegalArgumentException("Downloaded image is empty");
        }
        if (body.length > MAX_IMAGE_BYTES) {
            throw new IllegalArgumentException("Downloaded image is too large (max " + MAX_IMAGE_BYTES + " bytes)");
        }

        String contentType = Optional.ofNullable(resp.getHeaders().getFirst(HttpHeaders.CONTENT_TYPE)).orElse(null);
        if (StringUtils.hasText(contentType) && !contentType.toLowerCase().startsWith("image/")) {
            // Some servers omit content-type; but if present and not an image, reject.
            throw new IllegalArgumentException("URL did not return an image content type: " + contentType);
        }

        String filename = safeFilenameFromUrl(uri);
        ObjectId id = gridFsTemplate.store(new ByteArrayInputStream(body), filename, contentType);
        return new StoredImage(id.toHexString(), contentType, filename, body.length);
    }

    public GridFsResource getResource(String fileId) {
        if (!StringUtils.hasText(fileId)) {
            throw new IllegalArgumentException("Image not found");
        }
        ObjectId oid;
        try {
            oid = new ObjectId(fileId);
        } catch (Exception e) {
            throw new IllegalArgumentException("Image not found");
        }

        GridFSFile gridFsFile = gridFsTemplate.findOne(Query.query(Criteria.where("_id").is(oid)));
        if (gridFsFile == null) {
            throw new IllegalArgumentException("Image not found");
        }
        return new GridFsResource(gridFsFile, gridFsBucket.openDownloadStream(oid));
    }

    public void deleteIfExists(@Nullable String fileId) {
        if (!StringUtils.hasText(fileId)) {
            return;
        }
        try {
            ObjectId oid = new ObjectId(fileId);
            gridFsTemplate.delete(Query.query(Criteria.where("_id").is(oid)));
        } catch (Exception ignored) {
            // best-effort cleanup
        }
    }

    private static String safeFilenameFromUrl(URI uri) {
        String path = uri.getPath();
        if (!StringUtils.hasText(path)) {
            return "product-image";
        }
        int slash = path.lastIndexOf('/');
        String name = slash >= 0 ? path.substring(slash + 1) : path;
        if (!StringUtils.hasText(name)) {
            return "product-image";
        }
        // Keep ASCII-ish filenames to avoid surprises.
        byte[] bytes = name.getBytes(StandardCharsets.US_ASCII);
        String ascii = new String(bytes, StandardCharsets.US_ASCII);
        return ascii.length() > 120 ? ascii.substring(0, 120) : ascii;
    }
}
