import { CaretLeftIcon, CaretRightIcon, ListIcon } from '@phosphor-icons/react'
import { NavLink } from 'react-router'
import books from '../assets/books.json'
import { useEffect, useRef } from 'react'
import { useHead } from '@unhead/react'

export default function Home() {
  useHead({
    title: '主页'
  })

  const carouselRef = useRef<HTMLDivElement>(null);
  // scroll restoration
  useEffect(() => {
    const hash = location.hash;
    if (hash.length) {
      const bookIndex = books.findIndex(book => book.id === hash.slice(1));
      if (bookIndex >= 0) {
        carouselRef.current!.scrollLeft = carouselRef.current!.scrollWidth / books.length * bookIndex;
      }
    }
  }, []);

  function scrollNext() {
    carouselRef.current!.scrollBy(carouselRef.current!.scrollWidth / books.length, 0);
  }

  function scrollPrevious() {
    carouselRef.current!.scrollBy(-carouselRef.current!.scrollWidth / books.length, 0);
  }

  return (
    <main className='h-full relative'>
      <NavLink className='btn btn-primary btn-soft rounded-tl-full bottom-0 right-0 absolute w-20 h-20 transition-all hover:scale-105 origin-bottom-right z-200 active:!translate-none p-0 pl-4 pt-4' title='List Mode' to='/list' viewTransition>
        <div className='flex justify-center flex-col text-center'>
          <ListIcon size={30}/>
        </div>
      </NavLink>
      <div className='carousel w-full h-full' ref={carouselRef}>
        { books.map((book, index) => 
          <div className='carousel-item relative w-full h-full' id={book.id} key={book.id}>
            <div className='flex justify-center w-full py-3'>
              <NavLink className='text-center flex flex-col gap-3 justify-center md:justify-normal' to={`/view/${book.id}?from=home`} viewTransition>
                <div className='md:flex-grow flex flex-col justify-center'>
                  <span className='font-black text-3xl'>{ book.name }</span>
                  <span className='font-light text-sm text-zinc-500'>{ book.description }</span>
                </div>
                <img src={book.cover} alt={book.name} className='md:max-h-7/8 rounded'/>
              </NavLink>
            </div>
            <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
              {
                index > 0 ?
                <button className="btn btn-circle" onClick={scrollPrevious}><CaretLeftIcon weight='duotone' size={16}/></button> :
                <div />
              }
              {
                index < books.length - 1 ?
                <button className="btn btn-circle" onClick={scrollNext}><CaretRightIcon weight='duotone' size={16}/></button> :
                <div />
              }
            </div>
          </div>
        )}
      </div>
    </main>
  )
}