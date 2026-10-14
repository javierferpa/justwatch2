import { Directive, ElementRef, inject } from '@angular/core';

@Directive({ selector: 'img[appImageFallback]', host: { '(error)': 'onError()' } })
export class ImageFallbackDirective {
  private readonly element = inject<ElementRef<HTMLImageElement>>(ElementRef);
  onError(): void {
    const img = this.element.nativeElement;
    if (!img.src.endsWith('/assets/poster-placeholder.svg')) img.src = 'assets/poster-placeholder.svg';
  }
}
