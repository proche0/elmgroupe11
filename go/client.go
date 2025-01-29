package main

import (
	"encoding/json"
	"fmt"
	"net"
)

func main() {
	// Configurer le serveur
	conn, err := net.Dial("tcp", "localhost:8080")
	if err != nil {
		fmt.Println("Erreur de connexion :", err)
		return
	}
	defer conn.Close()

	// Demander les informations à l'utilisateur
	var startPage, endPage, language string

	fmt.Print("Entrez la page de départ : ")
	fmt.Scanln(&startPage)

	fmt.Print("Entrez la page d'arrivée : ")
	fmt.Scanln(&endPage)

	fmt.Print("Entrez la langue souhaitée (abréviation, ex : en pour anglais, fr pour français) : ")
	fmt.Scanln(&language)

	// Construire la requête JSON
	request := map[string]string{
		"start_page": startPage,
		"end_page":   endPage,
		"language":   language,
	}

	jsonRequest, err := json.Marshal(request)
	if err != nil {
		fmt.Println("Erreur lors de la création de la requête JSON :", err)
		return
	}

	// Envoyer la requête
	_, err = conn.Write(jsonRequest)
	if err != nil {
		fmt.Println("Erreur lors de l'envoi de la requête :", err)
		return
	}

	// Lire la réponse
	buffer := make([]byte, 4096)
	n, err := conn.Read(buffer)
	if err != nil {
		fmt.Println("Erreur lors de la lecture de la réponse :", err)
		return
	}

	fmt.Println("Réponse du serveur :", string(buffer[:n]))
}
