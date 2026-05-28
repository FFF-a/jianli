package com.liezhi.dto.response;

public class FavoriteStatusResponse {
    private boolean isFavorited;

    public FavoriteStatusResponse(boolean isFavorited) {
        this.isFavorited = isFavorited;
    }

    public boolean getIsFavorited() { return isFavorited; }
}
