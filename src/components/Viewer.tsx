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
  const [showSidebar, setShowSidebar] = useState(true);
  const flipRef = useRef<any>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const pages = [] as string[];
      const doc = await pdf.getDocument(props.url).promise;
      documentRef.current = doc;
      
      const max_height = viewportRef.current!.clientHeight - YPADDING;
      const max_width = viewportRef.current!.clientWidth / 2 - XPADDING / 2;
      const first_page = await doc.getPage(1);
      const viewport = first_page.getViewport({ scale: 1.0 });
      const aspect_ratio = viewport.width / viewport.height;
      if (max_width / max_height > aspect_ratio) { // container is wider than pdf
        setHeight(max_height);
        setWidth(max_height * aspect_ratio);
      } else {
        setWidth(max_width);
        setHeight(max_width / aspect_ratio);
      }

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
  }, [showSidebar]);

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
    <div className='flex h-full'>
      {
        showSidebar &&
        <div className="w-1/5 border-base-300 border-r-1 overflow-y-auto">
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
      }
      <div className="flex w-full flex-col overflow-hidden relative">
        <div className="flex gap-2 p-3 justify-center z-100">
          {
            initialized ? <>
              <button className="btn btn-sm absolute top-3 left-3 z-10" onClick={() => setShowSidebar(!showSidebar)}>
                {
                  showSidebar ? 
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M17.488 4.43a.75.75 0 0 1 .081 1.058L11.988 12l5.581 6.512a.75.75 0 1 1-1.139.976l-6-7a.75.75 0 0 1 0-.976l6-7a.75.75 0 0 1 1.058-.081Zm-4 0a.75.75 0 0 1 .081 1.058L7.988 12l5.581 6.512a.75.75 0 1 1-1.138.976l-6-7a.75.75 0 0 1 0-.976l6-7a.75.75 0 0 1 1.057-.081Z" clip-rule="evenodd"/></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M6.512 4.43a.75.75 0 0 1 1.057.082l6 7a.75.75 0 0 1 0 .976l-6 7a.75.75 0 0 1-1.138-.976L12.012 12L6.431 5.488a.75.75 0 0 1 .08-1.057Zm4 0a.75.75 0 0 1 1.058.082l6 7a.75.75 0 0 1 0 .976l-6 7a.75.75 0 0 1-1.14-.976L16.013 12l-5.581-6.512a.75.75 0 0 1 .081-1.057Z" clip-rule="evenodd"/></svg> 
                }
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => flipRef.current.pageFlip().turnToPage(0)} disabled={currentPage === 0 || flipping}> 
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="currentColor"><path d="M17.75 19a.75.75 0 0 1-1.32.488l-6-7a.75.75 0 0 1 0-.976l6-7A.75.75 0 0 1 17.75 5v14Z" opacity=".5"/><path fill-rule="evenodd" d="M13.488 19.57a.75.75 0 0 0 .081-1.058L7.988 12l5.581-6.512a.75.75 0 1 0-1.138-.976l-6 7a.75.75 0 0 0 0 .976l6 7a.75.75 0 0 0 1.057.082Z" clip-rule="evenodd"/></g></svg>
              </button>
              <button className="btn btn-sm btn-ghost" onClick={previousPage} disabled={currentPage <= 0 || flipping}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M10.53 5.47a.75.75 0 0 1 0 1.06l-4.72 4.72H20a.75.75 0 0 1 0 1.5H5.81l4.72 4.72a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/></svg>
              </button>
              <div className="flex flex-col justify-center">
                <span className="text-sm font-light">{ currentPage + 1 } of { pages.length }</span>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={nextPage} disabled={currentPage >= pages.length - 1 || flipping}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M13.47 5.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06l4.72-4.72H4a.75.75 0 0 1 0-1.5h14.19l-4.72-4.72a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg>
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => flipRef.current.pageFlip().turnToPage(pages.length - 1)} disabled={currentPage === pages.length - 1 || flipping}> 
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="currentColor"><path d="M6.25 19a.75.75 0 0 0 1.32.488l6-7a.75.75 0 0 0 0-.976l-6-7A.75.75 0 0 0 6.25 5v14Z" opacity=".5"/><path fill-rule="evenodd" d="M10.512 19.57a.75.75 0 0 1-.081-1.058L16.012 12l-5.581-6.512a.75.75 0 1 1 1.139-.976l6 7a.75.75 0 0 1 0 .976l-6 7a.75.75 0 0 1-1.058.082Z" clip-rule="evenodd"/></g></svg>
              </button>
              <input type="text" className="input input-sm max-w-[100px]" placeholder="Page to Go" value={gotoText} onChange={e => setGotoText(e.target.value)}/>
              <button className="btn btn-primary btn-sm" disabled={!isFinite(gotoPage) || gotoPage <= 0 || gotoPage > pages.length || flipping} onClick={goto}>Go</button>
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