import Viewer from "./components/Viewer";

export default function App() {
  return (
    <main className='h-screen'>
      <Viewer url='/book.pdf'/>
    </main>
  )
}
