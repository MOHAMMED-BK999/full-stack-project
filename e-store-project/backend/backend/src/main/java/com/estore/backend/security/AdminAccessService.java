package com.estore.backend.security;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminAccessService {
    // Single-admin setup per request: only this email can manage products.
    public static final String ADMIN_EMAIL = "mohamedbarik2005@gmail.com";
    public static final String ADMIN_EMAIL_HEADER = "X-User-Email";

    public boolean isAdminEmail(String email) {
        if (email == null) {
            return false;
        }
        return ADMIN_EMAIL.equalsIgnoreCase(email.trim());
    }

    public void assertAdmin(String email) {
        if (!isAdminEmail(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}

