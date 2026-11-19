package com.smartai.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class DocsTrainSummary {

    private int total;
    private int success;
    private int skipped;
    private int failed;
    private int vectorCount;
    private List<String> errors = new ArrayList<>();
}
