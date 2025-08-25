import { NavLink, useParams } from "react-router"
import books from '../assets/books.json'
import Viewer from "../components/Viewer";
import { BookIcon, FileXIcon, HouseIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useHead } from "@unhead/react";

export default function View() {
  const { bookId } = useParams();
  const book = books.filter(book => book.id === bookId)[0];

  useHead({
    title: book ? book.name : 'Not Found'
  })

  const [from, setFrom] = useState('home');
  useEffect(() => {
    let search = location.search;
    if (search.startsWith('?')) search = search.slice(1);
    const args = Object.fromEntries(search.split('?').map(segment => segment.split('=')));
    if (args.from) setFrom(args.from);
  })
  return (
    <main className='h-full'>
      {
        book ?
        <Viewer url={book.file}>
          <div className='breadcrumbs text-sm'>
            <ul>
              <li>
                <NavLink to={from === 'home' ? `/#${book.id}` : '/list'} viewTransition><HouseIcon weight='duotone'/> 主页</NavLink>
              </li>
              <li>
                <span><BookIcon weight='duotone'/> {book.name}</span>
              </li>
            </ul>
          </div>
          <div className='divider m-0'/>
        </Viewer> :
        <div className='h-full flex flex-col justify-center'>
          <div className='flex justify-center'>
            <div className='text-center'>
              <FileXIcon size={75} className='inline'/>
              <p className='font-black text-3xl mb-4'>Not Found</p>
              <NavLink className='btn btn-secondary btn-ghost' to='/' viewTransition>返回主页</NavLink>
            </div>
          </div>
        </div>
      }
    </main>
  )
}