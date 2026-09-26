async function settle(image: HTMLImageElement): Promise<void> {
  if (!image.complete) {
    await new Promise<void>((resolve) => {
      image.addEventListener(
        'load',
        () => {
          resolve();
        },
        { once: true },
      );
      image.addEventListener(
        'error',
        () => {
          resolve();
        },
        { once: true },
      );
    });
  }
  await image.decode().catch(() => undefined);
}

export async function settleImages(images: Iterable<HTMLImageElement>): Promise<void> {
  await Promise.all(Array.from(images, settle));
}
