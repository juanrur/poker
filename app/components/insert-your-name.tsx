'use client'

import { redirect } from "next/navigation";
import { createClient } from "../db/create-client-client";
import { usePlayer } from "./player-context";
import { v4 as uuid} from "uuid";

export default function InsertYourName() {
  const { setPlayer } = usePlayer();
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    
    const supabase = createClient()

    const id = uuid();
    
    supabase.from('players').insert({ name, id }).then(({ error }) => {
      if (error) {
        console.error("Error inserting player:", error);
      }
    })

    setPlayer({ id });

    redirect('/play')
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Insert Your Name</h1>
      <input type="text" name="name" placeholder="Enter your name" />
    </form>
  );
}