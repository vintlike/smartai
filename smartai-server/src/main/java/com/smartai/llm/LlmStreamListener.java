package com.smartai.llm;

/**
 * 流式回调，仅在调用线程触发。
 */
public interface LlmStreamListener {

    default void onOpen() {
    }

    default void onDelta(String delta) {
    }

    default void onComplete(String fullContent, LlmChatResponse lastChunk) {
    }

    default void onError(Throwable error) {
    }
}
