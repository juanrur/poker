'use client'
import { redirect } from "next/navigation";
import { usePlayer } from "@/modules/poker/presentation/hooks/usePlayer";

export default function InsertYourName() {
  const { createPlayer } = usePlayer();
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
        
    createPlayer(name).then(() => redirect('/play'))
    
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Insert Your Name</h1>
      <input type="text" name="name" placeholder="Enter your name" />
    </form>
  );
}