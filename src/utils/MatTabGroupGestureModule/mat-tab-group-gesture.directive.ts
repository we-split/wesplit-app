import { Directive, Input, OnInit } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { fromEvent } from 'rxjs';
import { pairwise, switchMap, takeUntil, tap } from 'rxjs/operators';

@Directive({
  selector: 'mat-tab-group[matTabGroupGesture]',
})
export class MatTabGroupGestureDirective implements OnInit {
  private headers: any;
  private headersList: any;
  private originalHeadersListTransition?: string;
  private headersMaxScroll?: number;

  private body: any;
  private skipBodySwipe = false;
  private bodyCurrentScroll?: { x: number; y: number };

  @Input() swipeLimitWidth = 80;
  @Input() connectEdges = true;

  constructor(private tabGroup: MatTabGroup) {}

  ngOnInit(): void {
    this.headers =
      this.tabGroup._elementRef.nativeElement.querySelector('mat-tab-header');
    if (!this.headers) {
      throw new Error('No headers found in DOM! Aborting...');
    }

    this.headersList = this.headers.querySelector('.mat-tab-list');
    if (!this.headersList) {
      throw new Error('No headers list found in DOM! Aborting...');
    }

    this.body = this.tabGroup._elementRef.nativeElement.querySelector(
      '.mat-tab-body-wrapper'
    );
    if (!this.body) {
      throw new Error('No body found in DOM! Aborting...');
    }

    this._handleHeadersEvents();
    this._handleBodyEvents();
  }

  private _handleHeadersEvents(): void {
    fromEvent(this.headers, 'touchstart')
      .pipe(
        tap(() => {
          this.originalHeadersListTransition =
            this.headersList.style.transition;
          this.headersList.style.transition = 'none';
          this.headersMaxScroll =
            -1 * (this.headersList.offsetWidth - this.headers.offsetWidth + 64);
        }),
        switchMap(e => {
          return fromEvent(this.headers, 'touchmove').pipe(
            takeUntil(
              fromEvent(this.headers, 'touchend').pipe(
                tap(
                  () =>
                    (this.headersList.style.transition =
                      this.originalHeadersListTransition)
                )
              )
            ),
            pairwise()
          );
        })
      )
      .subscribe((res: [any, any]) => {
        const rect = this.headers.getBoundingClientRect();
        const prevX = res[0].touches[0].clientX - rect.left;
        const currentX = res[1].touches[0].clientX - rect.left;

        this._scrollHeaders(currentX - prevX);
      });
  }

  private _scrollHeaders(scrollX: number): void {
    if (!this.headersList || !this.headersMaxScroll) {
      return;
    }

    const currentTransform = this.headersList.style.transform;
    let currentScroll: number;

    if (currentTransform && currentTransform.indexOf('translateX') > -1) {
      let tmp = currentTransform.substring('translateX('.length);
      tmp = tmp.substring(0, tmp.length - 'px)'.length);
      currentScroll = parseInt(tmp, 10);
    } else {
      currentScroll = 0;
    }
    let newScroll = currentScroll + scrollX;

    if (newScroll > 0) {
      newScroll = 0;
    }

    if (newScroll < this.headersMaxScroll) {
      newScroll = this.headersMaxScroll;
    }

    this.headersList.style.transform = `translateX(${newScroll}px)`;
  }

  private _handleBodyEvents(): void {
    fromEvent(this.body, 'touchstart')
      .pipe(
        switchMap((e: any) => {
          if (
            e
              .composedPath()
              .findIndex(
                (p: any) =>
                  p.className &&
                  typeof p.className === 'string' &&
                  p.className.indexOf('mat-slider') > -1
              ) > -1
          ) {
            this.skipBodySwipe = true;
          }

          return fromEvent(this.body, 'touchmove').pipe(
            takeUntil(
              fromEvent(this.body, 'touchend').pipe(
                tap(() => {
                  this.skipBodySwipe = false;
                  if (!this.bodyCurrentScroll) {
                    return;
                  }
                  if (
                    Math.abs(this.bodyCurrentScroll.y) >
                    Math.abs(this.bodyCurrentScroll.x)
                  ) {
                    return;
                  }
                  const limitPrev = this.swipeLimitWidth;
                  const limitNext = -1 * this.swipeLimitWidth;

                  if (
                    this.bodyCurrentScroll.x > limitPrev &&
                    this.bodyCurrentScroll.x < limitNext
                  ) {
                    return;
                  }
                  if (this.bodyCurrentScroll.x > limitPrev) {
                    this._prevTab();
                  } else if (this.bodyCurrentScroll.x < limitNext) {
                    this._nextTab();
                  }
                  this.bodyCurrentScroll = { x: 0, y: 0 };
                })
              )
            ),
            pairwise()
          );
        })
      )
      .subscribe((res: [any, any]) => {
        if (this.skipBodySwipe) {
          return;
        }
        const rect = this.body.getBoundingClientRect();

        const prevPos = {
          x: res[0].touches[0].clientX - rect.left,
          y: res[0].touches[0].clientY - rect.top,
        };

        const currentPos = {
          x: res[1].touches[0].clientX - rect.left,
          y: res[1].touches[0].clientY - rect.top,
        };

        if (!this.bodyCurrentScroll) {
          this.bodyCurrentScroll = { x: 0, y: 0 };
        }
        this.bodyCurrentScroll = {
          x: this.bodyCurrentScroll.x + currentPos.x - prevPos.x,
          y: this.bodyCurrentScroll.y + currentPos.y - prevPos.y,
        };
      });
  }

  private _prevTab(): void {
    if (
      this.tabGroup.selectedIndex === 0 ||
      this.tabGroup.selectedIndex === null
    ) {
      this.tabGroup.selectedIndex = this.connectEdges
        ? this.tabGroup._tabs.length - 1
        : this.tabGroup.selectedIndex;
    } else {
      this.tabGroup.selectedIndex--;
    }
  }

  private _nextTab(): void {
    if (this.tabGroup.selectedIndex === this.tabGroup._tabs.length - 1) {
      this.tabGroup.selectedIndex = this.connectEdges
        ? 0
        : this.tabGroup.selectedIndex;
    } else if (this.tabGroup.selectedIndex === null) {
      this.tabGroup.selectedIndex = 0;
    } else {
      this.tabGroup.selectedIndex++;
    }
  }
}
