package com.twelveweekyear.common.exception;

/** Thrown when a requested entity does not exist (or is not visible to the caller). */
public class ResourceNotFoundException extends AppException {

    public ResourceNotFoundException(String message) {
        super(ErrorCode.RESOURCE_NOT_FOUND, message);
    }
}
