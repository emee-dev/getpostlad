"use client";
import { WebContainer } from "@webcontainer/api";

export type Header = {
  key: string;
  value: string;
};

export type ResponseData = {
  headers: Header[];
  text_response: string;
  status: number;
  elapsed_time: number;
  content_size: number;
};


export default function Home() {

  const [isPending, setIsPending] = useState(false);

  const [webcontainerReady, setWebcontainerReady] = useState(false);
  const editor = useRef<EditorView | null>(null);
  const webcontainerRef = useRef<WebContainer | null>(null);

  // Initialize WebContainer
  useEffect(() => {
    let mounted = true;

    const initWebContainer = async () => {
      try {
        console.log("Booting WebContainer...");
        const webcontainerInstance = await WebContainer.boot(); 
        
        if (mounted) {
          webcontainerRef.current = webcontainerInstance;
          setWebcontainerReady(true);
          console.log("WebContainer ready!");
        }
      } catch (error) {
        console.error("Failed to boot WebContainer:", error);
      }
    };

    initWebContainer();

    // Cleanup function
    return () => {
      mounted = false;
      if (webcontainerRef.current) {
        console.log("Tearing down WebContainer...");
        webcontainerRef.current.teardown();
        webcontainerRef.current = null;
        setWebcontainerReady(false);
      }
    };
  }, []);

  const onSend = (src: string) => {
    console.log("Sending request:", src);
    console.log("WebContainer ready:", webcontainerReady);
    console.log("WebContainer instance:", webcontainerRef.current);

      async function execScriptInCode() {
    if (webcontainerRef.current) {
      let execProcess = await webcontainerRef.current.spawn("node", [
        "-v",
      ]);

      if (!execProcess) {
        console.log("Failed to execute script.");
        return;
      }

      execProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log("Piped:", data);
          },
        })
      );

      console.log("Running containers");
    } else {
      console.log("WebContainer was not loaded.");
    }
  }

  execScriptInCode()
  };

return (
  <div>
    <button onClick={() => onSend()}>Click me for version</button>
    <div>
      {
        webcontainerReady && <div>Container is ready</div>
      }
      {
        !webcontainerReady && <div>Container is not ready</div>
      }
    </div>
  </div>
)
}
  