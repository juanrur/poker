'use client'
import { redirect } from "next/navigation";
import { usePlayer } from "@/modules/poker/presentation/hooks/usePlayer";
import { useState } from "react";

export default function InsertYourName() {
  const [creatingPlayer, setCreatingPlayer] = useState<Boolean>(false)
  const { createPlayer } = usePlayer();
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
        
    setCreatingPlayer(true)
    createPlayer(name).then(() => {
      setCreatingPlayer(false)
      redirect('/play')
    })
    

  };

  if (creatingPlayer) 
    return <div className="grid place-content-center">
      <h1 className="font-bold text-2xl">Creating Player...</h1>
    </div> 
  return (
    <form onSubmit={handleSubmit}>
      <h1>Insert Your Name</h1>
      <input type="text" name="name" placeholder="Enter your name" />
    </form>
  );
}