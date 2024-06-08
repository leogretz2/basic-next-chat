"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { ClientMessage } from "../lib/chat/actions";
import { useActions, useUIState, useAIState } from "ai/rsc";
import { nanoid } from "nanoid";

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export default function Home() {
  const [input, setInput] = useState<string>("");
  // const [conversation, setConversation] = useUIState();
  // const [titleText, setTitleText] = useUIState();
  // Combined UIState to handle title and conversation
  const [uiState, setUIState] = useUIState();
  const [aiState, setAIState] = useAIState();
  const { continueConversation } = useActions();
  const router = useRouter()


  const { conversation = [], questionText = "" } = uiState;

  useEffect(() => {
    console.log('How about here?', session, messages)
    if (session?.user) {
      if (!path.includes('chat') && messages.length === 1) {
        window.history.replaceState({}, '', `/chat/${id}`)
      }
    }
  }, [id, path, session?.user, messages])

  useEffect(() => {
    console.log('this is the trigger?', aiState)
    const messagesLength = aiState.messages?.length
    if (messagesLength === 2) {
      router.refresh()
    }
  }, [aiState.messages, router])

  // Worry about chatId later
  // const [_, setNewChatId] = useLocalStorage('newChatId', id)
  // useEffect(() => {
  //   setNewChatId(id)
  // })


  

  console.log("uiS", uiState);
  console.log("aiS", aiState);

  console.log("tC", conversation);
  // console.log('tT',titleText)

  return (
    <div>
      <h1>{questionText}</h1>
      <div>
        {conversation.map((message: ClientMessage) => (
          <div key={message.id}>
            {message.role}: {message.display}
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
          }}
        />
        <button
          onClick={async () => {
            console.log();

            // First one to add user message to conversation
            // setUIState((prevState: any) => {
            //   console.log("prever", prevState);
            //   return {
            //     ...prevState,
            //     messages: [
            //       ...prevState.messages,
            //       { id: nanoid(), role: "user", display: input },
            //     ],
            //   };
            // });

            const message = await continueConversation(input);

            console.log("massage", message.display);

            // Second one to add message after continue conversation
            // setUIState((prevState: any) => ({
            //   ...prevState,
            //   messages: [...prevState.messages, message],
            //   questionText: message.display, // Example of updating titleText
            // }));
          }}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
