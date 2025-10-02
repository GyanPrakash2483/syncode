import React, { useRef, useState, useEffect, type JSX, useImperativeHandle } from "react";

interface TerminalProps {
  prompt: JSX.Element;
  commandHandler: (command: string) => Promise<string | undefined>;
  ref?: React.Ref<typeof Terminal>;
}

interface TerminalBlock {
  command: string;
  response: string;
}

type Terminal = (props: TerminalProps) => JSX.Element

export interface TerminalRef {
  clear: () => void,
  executeCommand: (command: string) => void
}

const Terminal: Terminal = (props: TerminalProps) => {

  const [isTerminalActive, setIsTerminalActive] = useState<boolean>(false);
  const [terminalHistory, setTerminalHistory] = useState<TerminalBlock[]>([]);

  const [currentCommand, setCurrentCommand] = useState<string>("");

  const keyPressHandler: React.KeyboardEventHandler<HTMLDivElement> = async (event: React.KeyboardEvent<HTMLDivElement>) => {
    event.preventDefault()
    if(/^[\S ]$/.test(event.key)) {
      setCurrentCommand(prev => prev + event.key);
    } else if(event.key === "Backspace") {
      setCurrentCommand(prev => prev.slice(0, -1));
    } else if(event.key === "Enter") {
      const response = await props.commandHandler(currentCommand);

      if(currentCommand != "clear") {
        setTerminalHistory((prevHistory: TerminalBlock[]): TerminalBlock[] => {
          const newHistory: TerminalBlock[] = [...prevHistory]
          newHistory.push({
            command: currentCommand,
            response: response || ""
          })
          return newHistory;
        })
      }
      setCurrentCommand("")
    }
  }

  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [currentCommand])

  useImperativeHandle(props.ref, (() => {
    return {
      clear() {
        setTerminalHistory([]);
      },
      async executeCommand(command: string) {
        const response = await props.commandHandler(command);

        if(currentCommand != "clear") {
          setTerminalHistory((prevHistory: TerminalBlock[]): TerminalBlock[] => {
            const newHistory: TerminalBlock[] = [...prevHistory]
            newHistory.push({
              command,
              response: response || ""
            })
            return newHistory;
          })
        }
      }
    }
  }) as unknown as (() => Terminal), []);

  return (
    <div 
      ref={terminalRef}
      className="w-full h-full bg-gray-900 text-white rounded-sm p-2 overflow-scroll"
      tabIndex={0}
      onFocus={() => setIsTerminalActive(true)}
      onBlur={() => setIsTerminalActive(false)}
      onKeyDown={keyPressHandler}
      onScroll={() => console.log("Hello")}
    >
      {
        terminalHistory.map((terminalblock, index) => {
          return (
            <div key={index}>
              <span>{props.prompt} {terminalblock.command}</span><br />
              <span className="whitespace-pre-line">{terminalblock.response}</span>
            </div>
          )
        })
      }
      <div>
        <span> {props.prompt} {currentCommand} </span>
        <span className="animate-ping"> {isTerminalActive ? "_" : ""} </span>
      </div>
    </div>
  )
}

export default Terminal;