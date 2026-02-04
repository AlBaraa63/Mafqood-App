"""
Test async embedding computation.
"""

import asyncio
import time
from pathlib import Path
import pytest

from app.embeddings import get_image_embedding, get_image_embedding_async


@pytest.mark.asyncio
async def test_async_embedding_returns_same_result(sample_image_file, temp_media_dir):
    """
    Test that async and sync versions produce the same embeddings.
    """
    # Create a temporary test image
    filename, file_content, content_type = sample_image_file
    test_image_path = temp_media_dir / "test_image.jpg"
    test_image_path.write_bytes(file_content)
    
    # Get embedding synchronously
    sync_embedding = get_image_embedding(test_image_path)
    
    # Get embedding asynchronously
    async_embedding = await get_image_embedding_async(test_image_path)
    
    # Should be identical
    assert len(sync_embedding) == len(async_embedding)
    assert sync_embedding == async_embedding


@pytest.mark.asyncio
async def test_async_embedding_non_blocking(sample_image_file, temp_media_dir):
    """
    Test that async embedding allows concurrent operations.
    """
    # Create test images
    filename, file_content, content_type = sample_image_file
    image_paths = []
    
    for i in range(3):
        test_image_path = temp_media_dir / f"test_image_{i}.jpg"
        test_image_path.write_bytes(file_content)
        image_paths.append(test_image_path)
    
    # Process multiple embeddings concurrently
    start_time = time.time()
    
    tasks = [get_image_embedding_async(path) for path in image_paths]
    embeddings = await asyncio.gather(*tasks)
    
    concurrent_time = time.time() - start_time
    
    # Process sequentially for comparison
    start_time = time.time()
    
    sequential_embeddings = [get_image_embedding(path) for path in image_paths]
    
    sequential_time = time.time() - start_time
    
    # Verify results are correct
    assert len(embeddings) == 3
    assert all(len(emb) > 0 for emb in embeddings)
    
    # Concurrent should be faster (or at least not much slower)
    # Note: This is a rough test - actual speedup depends on CPU
    print(f"\n⏱️  Concurrent: {concurrent_time:.3f}s, Sequential: {sequential_time:.3f}s")
    assert concurrent_time <= sequential_time * 1.5  # Allow some overhead


@pytest.mark.asyncio
async def test_async_embedding_error_handling(temp_media_dir):
    """
    Test that async embedding handles errors properly.
    """
    non_existent_path = temp_media_dir / "does_not_exist.jpg"
    
    with pytest.raises(FileNotFoundError):
        await get_image_embedding_async(non_existent_path)
