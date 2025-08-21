import { useEffect, useRef, useState } from "react"
import HTMLFlipBook from "react-pageflip"
import * as pdf from 'pdfjs-dist'

const FlipBook: any = HTMLFlipBook;
const XPADDING = 120;
const YPADDING = 60;
const YTRANSLATE = -30;

export interface ViewerProps {
  url: string
}

export default function Viewer(props: ViewerProps) {
  const [pages, setPages] = useState([] as string[]);
  const [outline, setOutline] = useState([] as any[]);
  const [initialized, setInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [gotoText, setGotoText] = useState('');
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const flipRef = useRef<any>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<any>(null);

  useEffect(() => {
    setHeight(viewportRef.current!.clientHeight - YPADDING);
    setWidth(viewportRef.current!.clientWidth / 2 - XPADDING / 2);
    (async () => {
      const pages = [] as string[];
      const doc = await pdf.getDocument(props.url).promise;
      documentRef.current = doc;
      for (let i = 1; i <= doc.numPages; ++i) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 2.5 });
        const canvas = document.createElement('canvas');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const context = canvas.getContext('2d')!;

        await page.render({
          viewport,
          canvas,
          canvasContext: context,
        }).promise;

        pages.push(canvas.toDataURL());
      };

      setOutline(await doc.getOutline());
      setPages(pages);
    })();
  }, []);

  function previousPage() {
    flipRef.current.pageFlip().flipPrev();
  }

  function nextPage() {
    flipRef.current.pageFlip().flipNext();
  }

  async function gotoDest(dest: string | any[] | null) {
    if (dest === null) return;
    const doc = documentRef.current;
    if (typeof dest === 'string') {
      dest = await doc.getDestination(dest);
    }
    const pageIndex = await doc.getPageIndex(dest![0]);
    flipRef.current.pageFlip().turnToPage(pageIndex);
  }
  
  const gotoPage = parseInt(gotoText);

  function goto() {
    flipRef.current.pageFlip().turnToPage(gotoPage-1);
    setGotoText('');
  }

  function onChangeState(e: any) {
    if (e.data === 'flipping') {
      setFlipping(true);
    }
    else {
      setFlipping(false);
    }
  }

  return (
    <div className='grid grid-cols-5 h-full'>
      <div className="border-base-300 border-r-1 overflow-y-auto">
        <h1 className="text-xl font-black p-5 pb-3">目录</h1>
        {
          initialized ?
          <ul className="menu w-full">
            {outline.map(item => 
              <li key={item.title}>
                {
                  item.items.length ? 
                  <details>
                    <summary><a href='#' onClick={() => gotoDest(item.dest)}>{ item.title }</a></summary>
                    <ul>
                      { item.items.map((subitem: any) => 
                        <li key={subitem.title}><a href='#' onClick={() => gotoDest(subitem.dest)}>{ subitem.title }</a></li>
                      )}
                    </ul>
                  </details> :
                  <a href='#' onClick={() => gotoDest(item.dest)}>{ item.title }</a>
                }
              </li>
            )}
          </ul> :
          <div className='flex w-full flex-col gap-2 px-5 mt-3'>
            <div className='skeleton h-6'></div>
            <div className='skeleton h-6 ml-8'></div>
            <div className='skeleton h-6 ml-8'></div>
            <div className='skeleton h-6'></div>
            <div className='skeleton h-6 ml-8'></div>
            <div className='skeleton h-6 ml-8'></div>
            <div className='skeleton h-6'></div>
            <div className='skeleton h-6 ml-8'></div>
            <div className='skeleton h-6 ml-8'></div>
          </div>
        }
      </div>
      <div className="col-span-4 flex flex-col overflow-hidden">
        <div className="flex gap-2 p-3 justify-center z-100">
          {
            initialized ? <>
              <button className="btn btn-sm btn-primary" onClick={previousPage} disabled={currentPage <= 0 || flipping}>Previous Page</button>
              <div className="flex flex-col justify-center">
                <span className="text-sm font-light">{ currentPage + 1 } of { pages.length }</span>
              </div>
              <button className="btn btn-sm btn-primary" onClick={nextPage} disabled={currentPage >= pages.length - 1 || flipping}>Next Page</button>
              <input type="text" className="input input-sm max-w-[100px]" placeholder="Page to Go" value={gotoText} onChange={e => setGotoText(e.target.value)}/>
              <button className="btn btn-secondary btn-sm" disabled={!isFinite(gotoPage) || gotoPage <= 0 || gotoPage > pages.length || flipping} onClick={goto}>Go</button>
            </> : undefined
          }
        </div>
        <div className="flex-grow flex justify-center relative" ref={viewportRef} style={{ transform: initialized ? `translateY(${YTRANSLATE}px)`: 'none' }}>
          {
            initialized ?
            undefined :
            <div className='w-full p-10 absolute h-full'>
              <div className='skeleton w-full h-full'></div>
            </div>
          }
          <FlipBook width={width} height={height} ref={flipRef} onInit={() => setInitialized(true)} onFlip={(e: any) => setCurrentPage(e.data)} onChangeState={onChangeState} flippingTime={500}>
            {pages.map((dataUrl, index) => 
              <img src={dataUrl} alt={`Page ${index}`} key={index}/>
            )}
          </FlipBook>
        </div>
      </div>
    </div>
  )
}