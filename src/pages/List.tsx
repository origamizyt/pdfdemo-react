import { NavLink } from 'react-router'
import { BookOpenTextIcon, HouseIcon, ListIcon, XCircleIcon } from '@phosphor-icons/react'
import books from '../assets/books.json'
import { useState } from 'react'
import { useHead } from '@unhead/react'

export default function List() {
  useHead({
    title: '列表'
  })

  const [filteredBooks, setFilteredBooks] = useState(books);
  const [searchText, setSearchText] = useState('');

  function search() {
    setFilteredBooks(books.filter(book => book.name.includes(searchText)));
  }

  return (
    <main className='h-full relative'>
      <NavLink className='btn btn-primary btn-soft rounded-tl-full bottom-0 right-0 absolute w-20 h-20 transition-all hover:scale-105 origin-bottom-right z-200 active:!translate-none p-0 pl-4 pt-4' title='List Mode' to='/' viewTransition>
        <div className='flex justify-center flex-col text-center'>
          <HouseIcon size={30}/>
        </div>
      </NavLink>
      <div className='px-3 pt-5 md:max-w-1/3 mx-auto'>
        <div className='flex justify-between'>
          <div className='breadcrumbs text-sm md:text-base'>
            <ul>
              <li>
                <NavLink to='/' title='Home' viewTransition>
                  <HouseIcon/>
                  主页
                </NavLink>
              </li>
              <li>
                <span>
                  <ListIcon/>
                  列表
                </span>
              </li>
            </ul>
          </div>
          <div className='flex flex-col justify-center'>
            <div className='flex gap-1'>
              <input type="text" className="input input-sm max-w-[200px]" placeholder="Search" value={searchText} onChange={e => setSearchText(e.target.value)}/>
              <button className='btn btn-secondary btn-sm' onClick={search}>搜索</button>
            </div>
          </div>
        </div>
        <div className='divider text-sm tracking-widest'>
          {filteredBooks.length}/{books.length}
        </div>
        <ol className='list'>
          {
            filteredBooks.map(book => 
              <li className='list-row' key={book.id}>
                <img src={book.cover} alt={book.name} className='max-h-20 rounded'/>
                <div className='flex flex-col justify-center gap-2'>
                  <h2 className='font-black text-xl md:text-2xl'>
                    {book.name}
                    <span className='text-base md:text-lg ml-2 text-zinc-500'>共 {book.pages} 页</span>
                  </h2>
                  <p className='font-light text-xs md:text-sm'>{book.description}</p>
                </div>
                <div className='flex flex-col justify-center'>
                  <NavLink className='btn btn-sm btn-primary' to={`/view/${book.id}?from=list`}>
                    <BookOpenTextIcon/>
                    阅读
                  </NavLink>
                </div>
              </li>
            )
          }
          {
            !filteredBooks.length &&
            <div className='alert alert-error alert-soft'>
              <XCircleIcon/>
              <span>
                没有符合条件的书籍。
              </span>
            </div>
          }
        </ol>
      </div>
    </main>
  )
}