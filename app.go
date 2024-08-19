package main

import (
	"context"
	"fmt"
	"log"
	"os"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) SaveFile(filename string, file string) bool {
	f, err := os.Create(filename)
	if err != nil {
		log.Fatal(err)
		return false
	}

	n, err := f.WriteString(file + "\n")
	if err != nil {
		log.Fatal(err)
		return false
	}
	fmt.Printf("wrote %d bytes\n", n)
	f.Sync()
	return true
}
