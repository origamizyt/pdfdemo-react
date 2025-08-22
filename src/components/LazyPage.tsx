import { forwardRef, useEffect, useState } from "react";

const THRESHOLD = 4;

export interface LazyPageProps {
  pageIndex: number,
  currentPage: number,
  requireDataUrl(index: number): Promise<string>
  onLoad?(): void
}

export const LazyPage = forwardRef<HTMLDivElement, LazyPageProps>((props, ref) => {
  const show = Math.abs(props.pageIndex - props.currentPage) <= THRESHOLD;
  const [dataUrl, setDataUrl] = useState<string>()
  useEffect(() => {
    if (show) {
      if (!dataUrl)
        props.requireDataUrl(props.pageIndex).then(dataUrl => {
          setDataUrl(dataUrl);
          props.onLoad?.();
        });
      else
        props.onLoad?.();
    }
    else {
      setDataUrl(undefined);
    }
  }, [props.currentPage])
  return (
    <div ref={ref}>
      {
        show && dataUrl &&
        <img src={dataUrl} alt={`Page ${props.pageIndex}`} />
      }
    </div>
  )
})