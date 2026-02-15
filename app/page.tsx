import InsertYourName from "./components/insert-your-name";

export default function Home() { 
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-10">
      <h1>Poker</h1>
      <InsertYourName />
    </main>
  )
}
