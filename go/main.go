package main

import (
    "encoding/json"
    "fmt"
    "net"
    "net/http"
    "strings"
    "sync"
    "time"

    "golang.org/x/net/html"
)

type Request struct {
    StartPage string `json:"start_page"`
    EndPage   string `json:"end_page"`
    Language  string `json:"language"`
}

var (
    httpClient = &http.Client{
        Timeout: 60 * time.Second,
        Transport: &http.Transport{
            MaxIdleConns:        100,
            IdleConnTimeout:     90 * time.Second,
            MaxIdleConnsPerHost: 50,
        },
    }
)

func getWithRetry(url string, retries int) (*http.Response, error) {
    for i := 0; i < retries; i++ {
        resp, err := httpClient.Get(url)
        if err == nil {
            return resp, nil
        }
        fmt.Printf("Retry %d for %s: %v\n", i+1, url, err)
        time.Sleep(2 * time.Second)
    }
    return nil, fmt.Errorf("Failed after %d attempts for %s", retries, url)
}

func getLinksFromPage(page, language string) ([]string, error) {
    url := fmt.Sprintf("https://%s.wikipedia.org/wiki/%s", language, page)
    resp, err := getWithRetry(url, 3)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("Error loading page: %s", page)
    }

    var links []string
    tokenizer := html.NewTokenizer(resp.Body)
    for {
        tokenType := tokenizer.Next()
        if tokenType == html.ErrorToken {
            break
        }

        token := tokenizer.Token()
        if tokenType == html.StartTagToken && token.Data == "a" {
            for _, attr := range token.Attr {
                if attr.Key == "href" && strings.HasPrefix(attr.Val, "/wiki/") && !strings.Contains(attr.Val, ":") {
                    link := strings.TrimPrefix(attr.Val, "/wiki/")
                    links = append(links, link)
                }
            }
        }
    }

    return links, nil
}

func findShortestPath(startPage, endPage, language string, maxDepth int) ([]string, error) {
    visited := sync.Map{}
    queue := [][]string{{startPage}}
    addedToQueue := sync.Map{} // Pour éviter les doublons dans la file d'attente.
    var mu sync.Mutex
    var wg sync.WaitGroup
    var result []string
    var found bool
    semaphore := make(chan struct{}, 5)

    for depth := 0; depth <= maxDepth && !found; depth++ {
        var nextQueue [][]string

        for _, path := range queue {
            currentPage := path[len(path)-1]

            if strings.EqualFold(cleanLink(currentPage), cleanLink(endPage)) {
                mu.Lock()
                result = path
                found = true
                mu.Unlock()
                break
            }

            if _, ok := visited.LoadOrStore(currentPage, true); ok {
                continue
            }

            wg.Add(1)
            semaphore <- struct{}{}
            go func(currentPage string, path []string) {
                defer wg.Done()
                defer func() { <-semaphore }()

                links, err := getLinksFromPage(currentPage, language)
                if err != nil {
                    fmt.Printf("Error extracting links for %s: %v\n", currentPage, err)
                    return
                }

                for _, link := range links {
                    // Éviter les doublons dans la queue
                    if _, alreadyAdded := addedToQueue.LoadOrStore(link, true); !alreadyAdded {
                        newPath := append([]string(nil), path...)
                        newPath = append(newPath, link)
                        mu.Lock()
                        nextQueue = append(nextQueue, newPath)
                        mu.Unlock()
                    }
                }
            }(currentPage, path)
        }

        wg.Wait()
        queue = nextQueue
    }

    if found {
        return result, nil
    }
    return nil, fmt.Errorf("No path found between %s and %s within depth limit %d", startPage, endPage, maxDepth)
}

func cleanLink(link string) string {
    return strings.TrimSpace(link)
}

func handleClient(conn net.Conn) {
    defer conn.Close()
    fmt.Println("Client connection received")

    conn.SetDeadline(time.Now().Add(180 * time.Second))

    buffer := make([]byte, 1024)
    n, err := conn.Read(buffer)
    if err != nil {
        fmt.Printf("Error reading data: %v\n", err)
        conn.Write([]byte(fmt.Sprintf(`{"error":"%s"}`, err.Error())))
        return
    }

    var req Request
    if err := json.Unmarshal(buffer[:n], &req); err != nil {
        fmt.Println("JSON decoding error:", err)
        conn.Write([]byte(`{"error":"Invalid JSON"}`))
        return
    }

    fmt.Printf("Request received: StartPage=%s, EndPage=%s, Language=%s\n", req.StartPage, req.EndPage, req.Language)
    if err := validatePage(req.StartPage, req.Language); err != nil {
        conn.Write([]byte(fmt.Sprintf(`{"error":"%s"}`, err.Error())))
        return
    }
    if err := validatePage(req.EndPage, req.Language); err != nil {
        conn.Write([]byte(fmt.Sprintf(`{"error":"%s"}`, err.Error())))
        return
    }

    path, err := findShortestPath(req.StartPage, req.EndPage, req.Language, 40)
    if err != nil {
        fmt.Println("Error executing algorithm:", err)
        conn.Write([]byte(fmt.Sprintf(`{"error":"%s"}`, err.Error())))
        return
    }

    response := map[string]interface{}{
        "path": path,
    }

    jsonResponse, err := json.Marshal(response)
    if err != nil {
        fmt.Println("Error serializing response:", err)
        conn.Write([]byte(`{"error":"Internal server error"}`))
        return
    }

    fmt.Printf("Response sent to client: %s\n", string(jsonResponse))
    _, err = conn.Write(jsonResponse)
    if err != nil {
        fmt.Println("Error sending response:", err)
    }
}

func validatePage(page, language string) error {
    url := fmt.Sprintf("https://%s.wikipedia.org/wiki/%s", language, page)
    resp, err := httpClient.Get(url)
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return fmt.Errorf("Page %s does not exist or could not be loaded", page)
    }
    return nil
}

func startServer(port string) {
    fmt.Println("Starting server...")
    listener, err := net.Listen("tcp", ":"+port)
    if err != nil {
        fmt.Println("Error starting server:", err)
        return
    }

    defer listener.Close()
    fmt.Println("Server listening on port", port)

    for {
        fmt.Println("Waiting for a connection...")
        conn, err := listener.Accept()
        if err != nil {
            fmt.Println("Error accepting connection:", err)
            continue
        }

        fmt.Println("New connection accepted")
        go handleClient(conn)
    }
}

func main() {
    go startServer("8080")
    select {}
}
