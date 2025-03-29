declare module "pdfjs-dist/web/text_highlighter" {
    export class TextHighlighter {
      constructor(params: {
        findController?: FindController;
        eventBus: EventBus;
        pageIndex: number;
      });
  
      setTextMapping(textDivs: HTMLElement[], textContent: string[]): void;
      enable(): void;
      disable(): void;
    }
  }
  