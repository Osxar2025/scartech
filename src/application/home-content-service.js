export class HomeContentService {
  constructor(productRepository, mediaRepository, fallbackContent) {
    this.productRepository = productRepository;
    this.mediaRepository = mediaRepository;
    this.fallbackContent = fallbackContent;
  }

  async getFeaturedContent() {
    const [products, media] = await Promise.all([
      this.productRepository.list(),
      this.mediaRepository.list()
    ]);

    return {
      products: products.length ? products : this.fallbackContent.products,
      media: media.music.length || media.image.length || media.video.length
        ? media
        : this.fallbackContent.media
    };
  }
}
