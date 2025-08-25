import { useEffect, useRef, useState } from "react"
import HTMLFlipBook from "react-pageflip"
import * as pdf from 'pdfjs-dist'
import { LazyPage } from "./LazyPage";
import { CaretLeftIcon, CaretRightIcon, CaretLineLeftIcon, CaretLineRightIcon, SidebarIcon, CaretDoubleLeftIcon, CursorClickIcon, ArrowLineDownRightIcon, ArrowLineUpRightIcon, ArrowLineDownLeftIcon, ArrowLineUpLeftIcon, HandSwipeLeftIcon, HandSwipeRightIcon } from "@phosphor-icons/react";
import useLocalStorage from "../hooks/useLocalStorage";

const FlipBook: any = HTMLFlipBook;
const XPADDING = 120;
const YPADDING = 60;
const YTRANSLATE = -10;

export interface ViewerProps {
  url: string,
  children?: any
}

export default function Viewer(props: ViewerProps) {
  const [pages, setPages] = useState(0);
  const [outline, setOutline] = useState<any[] | null>([]);
  const [initialized, setInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [gotoText, setGotoText] = useState('');
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shouldShowHint, setShouldShowHint] = useLocalStorage({
    key: 'should-show-hint',
    default: true,
  })
  const [hint, setHint] = useState({ top: 0, left: 0, height: 0, width: 0, show: false });
  const flipRef = useRef<any>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<any>(null);

  useEffect(() => {
    // mobile screen, close sidebar
    if (isMobile) {
      setShowSidebar(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!loading && flipRef.current.pageFlip() && shouldShowHint) {
      showHint();
    }
  }, [loading]);

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 48rem)').matches;
    setIsMobile(isMobile);
    (async () => {
      const doc = await pdf.getDocument(props.url).promise;
      documentRef.current = doc;
      
      let max_height = viewportRef.current!.clientHeight;
      let max_width = viewportRef.current!.clientWidth;
      if (!isMobile) {
        max_height -= YPADDING;
        max_width -= XPADDING;
        max_width /= 2;
      }
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

      setOutline(await doc.getOutline());
      setPages(doc.numPages);
    })();
  }, [showSidebar]);

  function firstPage() {
    flipRef.current.pageFlip().turnToPage(0);
  }

  function lastPage() {
    flipRef.current.pageFlip().turnToPage(pages - 1);
  }

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

    if (pageIndex !== currentPage)
      setLoading(true);
    
    setCurrentPage(pageIndex);

    // mobile screen, close sidebar
    if (isMobile) {
      setShowSidebar(false);
    }
  }
  
  const gotoPage = parseInt(gotoText);

  function goto() {
    flipRef.current.pageFlip().turnToPage(gotoPage-1);
    setGotoText('');
    if (gotoPage - 1 !== currentPage)
      setLoading(true);
    setCurrentPage(gotoPage - 1);
  }

  function onChangeState(e: any) {
    if (e.data === 'flipping') {
      setFlipping(true);
    }
    else {
      setFlipping(false);
    }
  }

  async function requireDataUrl(index: number): Promise<string> {
    const page = await documentRef.current.getPage(index + 1);
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

    return canvas.toDataURL();
  }

  function renderOutlineItems(items: any[]) {
    return <>
      {items.map(item => 
        <li key={item.title}>
          {
            item.items.length ? 
            <details>
              <summary><span onClick={() => gotoDest(item.dest)}>{ item.title }</span></summary>
              <ul>
                {renderOutlineItems(item.items)}
              </ul>
            </details> :
            <span onClick={() => gotoDest(item.dest)}>{ item.title }</span>
          }
        </li>
      )}
    </>
  }

  function showHint() {
    const rect = flipRef.current.pageFlip().ui.parentElement.getBoundingClientRect();
    setHint({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      show: true
    });
  }

  function hideHint() {
    setHint({
      ...hint,
      show: false
    });
    setShouldShowHint(false);
  }

  return (
    <div className='flex h-full relative'>
      {
        loading &&
        <div className='absolute top-0 left-0 w-full h-full bg-white/20 backdrop-opacity-10 flex flex-col justify-center z-300'>
          <div className='text-center'>
            <span className='loading loading-bars loading-xl'></span>
            <p className='mt-2 font-light'>Loading...</p>
          </div>
      </div>
      }
      { hint.show &&
        <div className='absolute top-0 left-0 w-full h-full backdrop-blur-xs bg-black/50 z-250' onMouseDown={hideHint}>
          <div className='relative border-base-content/50 border-dashed border-2 grid grid-cols-2' style={{
            top: `${hint.top}px`,
            left: `${hint.left}px`,
            width: `${hint.width}px`,
            height: `${hint.height}px`,
          }}>
            <div className='border-r-1 border-base-content/50 border-dashed h-full flex flex-col justify-center'>
              <div className='text-center'>
                { isMobile ? 
                  <HandSwipeLeftIcon size={50} className='inline-block' weight="duotone"/> :
                  <CursorClickIcon size={50} className='inline-block' weight="duotone"/>
                }
                <p className='font-bold'>点击左侧向前翻页</p>
              </div>
            </div>
            <div className='border-l-1 border-base-content/50 border-dashed h-full flex flex-col justify-center'>
              <div className='text-center'>
                { isMobile ? 
                  <HandSwipeRightIcon size={50} className='inline-block' weight="duotone"/> :
                  <CursorClickIcon size={50} className='inline-block' weight="duotone"/>
                }
                <p className='font-bold'>点击右侧向后翻页</p>
              </div>
            </div>
            { !isMobile &&
              <>
                <div className='absolute top-0 left-0 p-1 flex gap-2'>
                  <ArrowLineDownRightIcon size={30} weight='duotone'/>
                  <div className='flex flex-col justify-center text-sm'>
                    向右下拖拽翻页
                  </div>
                </div>
                <div className='absolute bottom-0 left-0 p-1 flex gap-2'>
                  <ArrowLineUpRightIcon size={30} weight='duotone'/>
                  <div className='flex flex-col justify-center text-sm'>
                    向右上拖拽翻页
                  </div>
                </div>
              </>
            }
            <div className='absolute top-0 right-0 p-1 flex gap-2'>
              <ArrowLineDownLeftIcon size={30} weight='duotone'/>
              <div className='flex flex-col justify-center text-sm'>
                向左下拖拽翻页
              </div>
            </div>
            <div className='absolute bottom-0 right-0 p-1 flex gap-2'>
              <ArrowLineUpLeftIcon size={30} weight='duotone'/>
              <div className='flex flex-col justify-center text-sm'>
                向左上拖拽翻页
              </div>
            </div>
          </div>
        </div>
      }
      <div className="w-full md:w-1/5 border-base-300 border-r-1 overflow-y-auto transition-all absolute md:static h-full z-200 bg-base-100" style={{ marginLeft: showSidebar ? 0 : '-20%', transform: showSidebar ? 'none' : 'translateX(-80%)'}}>
        
        <div className='px-5 py-3'>
          {props.children}
        </div>
        <div className="flex justify-between px-5 pb-3">
          <h1 className="text-xl font-black">目录</h1>
          <button className="btn btn-sm md:hidden" onClick={() => setShowSidebar(!showSidebar)}>
            <CaretDoubleLeftIcon weight="fill" size={18}/>
          </button>
        </div>
        {
          initialized ?
          <ul className="menu w-full">
            {outline && renderOutlineItems(outline)}
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
      <div className="flex w-full flex-col overflow-hidden relative">
        <div className="flex md:gap-2 p-3 justify-end md:justify-center z-100">
          {
            initialized ? <>
              <button className="btn btn-xs md:btn-sm absolute top-3 left-3 z-10" onClick={() => setShowSidebar(!showSidebar)}>
                {
                  showSidebar ? 
                  <CaretDoubleLeftIcon weight="fill" size={18}/>
                  : <SidebarIcon weight="fill" size={18}/>
                }
              </button>
              <button className="btn btn-ghost btn-xs md:btn-sm" onClick={firstPage} disabled={currentPage === 0 || flipping}> 
                <CaretLineLeftIcon weight="duotone" size={18}/>
              </button>
              <button className="btn btn-xs md:btn-sm btn-ghost" onClick={previousPage} disabled={currentPage <= 0 || flipping}>
                <CaretLeftIcon weight="duotone" size={18}/>
              </button>
              <div className="flex flex-col justify-center">
                <span className="text-xs md:text-sm font-light">{ currentPage + 1 } {isMobile ? "/" : "of"} { pages }</span>
              </div>
              <button className="btn btn-xs md:btn-sm btn-ghost" onClick={nextPage} disabled={currentPage >= pages - 1 || flipping}>
                <CaretRightIcon weight="duotone" size={18}/>
              </button>
              <button className="btn btn-ghost btn-xs md:btn-sm" onClick={lastPage} disabled={currentPage === pages - 1 || flipping}> 
                <CaretLineRightIcon weight="duotone" size={18}/>
              </button>
              <input type="text" className="input input-xs md:input-sm max-w-[100px] mr-1 md:mr-0" placeholder="Page to Go" value={gotoText} onChange={e => setGotoText(e.target.value)}/>
              <button className="btn btn-primary btn-xs md:btn-sm" disabled={!isFinite(gotoPage) || gotoPage <= 0 || gotoPage > pages || flipping} onClick={goto}>Go</button>
            </> : undefined
          }
        </div>
        <div className="flex-grow flex justify-center relative max-h-[calc(100%-56px)]" ref={viewportRef} style={{ transform: initialized ? `translateY(${YTRANSLATE}px)`: 'none' }}>
          {
            !initialized && 
            <div className='w-full p-10 absolute h-full'>
              <div className='skeleton w-full h-full'></div>
            </div>
          }
          <FlipBook width={width} height={height} ref={flipRef} onInit={() => {
            setInitialized(true);
            setLoading(true);
          }} onFlip={(e: any) => setCurrentPage(e.data)} onChangeState={onChangeState} flippingTime={500} usePortrait={isMobile} showCover>
            {Array(pages).fill(null).map((_, index) =>
              <LazyPage pageIndex={index} currentPage={currentPage} requireDataUrl={requireDataUrl} key={index} onLoad={() => {
                if (currentPage === index) setLoading(false);
              }}/>
            )}
          </FlipBook>
        </div>
      </div>
    </div>
  )
}