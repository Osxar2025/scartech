export class HomeContentService {
  constructor(productRepository, mediaRepository) {
    this.productRepository = productRepository;
    this.mediaRepository = mediaRepository;
  }

  async getFeaturedContent() {
    const [products, media] = await Promise.all([
      this.productRepository.list(),
      this.mediaRepository.list()
    ]);

    return {
      products,
      media
    };
  }
}
