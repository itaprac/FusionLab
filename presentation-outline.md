## Motivation

- W rzeczywistych problemach decyzje rzadko są podejmowane na podstawie jednego, w pełni pewnego źródła danych.
- Informacje bywają niepełne, sprzeczne lub obarczone niepewnością.
- Nasz projekt pokazuje, jak metody fuzji danych mogą pomóc w uzyskaniu bardziej wiarygodnego wyniku końcowego.
- Aplikacja łączy aspekt praktyczny i edukacyjny: użytkownik może zobaczyć zarówno sam wynik fuzji, jak i porównać różne podejścia.
- Dobrym przykładem motywacji w projekcie jest scenariusz oceny zagrożenia lawinowego, gdzie trzeba połączyć dane pogodowe i obserwacje terenowe.

## Requirements

- Użytkownik powinien móc wybrać metodę fuzji: `Dempster`, `PCR5`, `PCR6`.
- System powinien umożliwiać dodawanie wielu źródeł informacji i definiowanie ich mas przekonań.
- Aplikacja powinna obliczać wynik fuzji oraz poziom konfliktu między źródłami.
- Użytkownik powinien mieć dostęp do gotowych przykładów pokazujących zastosowanie metod.
- System powinien wspierać pipeline ML: wybór datasetu, wybór kilku modeli i fuzję ich predykcji.
- Aplikacja powinna umożliwiać wgrywanie własnych plików CSV i konfigurację kolumn cech oraz targetu.
- Wyniki powinny być prezentowane w czytelnej formie tabelarycznej i wizualnej.
- Interfejs powinien być prosty, nowoczesny i wygodny w użyciu.

## Technology

- Frontend: `React` + `Vite`
- Stylowanie UI: `Tailwind CSS`
- Backend API: `FastAPI`
- Język backendu: `Python`
- Uczenie maszynowe i przetwarzanie danych: `scikit-learn`, `NumPy`
- Silnik fuzji danych: własna implementacja oparta o `Dempster-Shafer` oraz `PCR5/PCR6`
- Komunikacja frontend-backend: REST API

## Advantages

- Projekt rozwiązuje realny problem łączenia niepewnych i sprzecznych danych.
- Łączy klasyczną teorię fuzji informacji z praktycznym zastosowaniem w ML.
- Pozwala porównywać wyniki pojedynczych modeli z wynikiem po fuzji.
- Obsługuje zarówno gotowe datasety, jak i własne dane użytkownika.
- Pokazuje konflikt między źródłami, więc wynik jest bardziej interpretowalny.
- Aplikacja ma wartość edukacyjną, badawczą i praktyczną.
- Interfejs jest interaktywny i ułatwia demonstrację działania projektu podczas prezentacji.

## Future Works

- Dodanie większej liczby przykładów zastosowań z życia codziennego i przemysłu.
- Rozszerzenie modułu ML o pełne wsparcie `PCR6`.
- Dodanie historii eksperymentów i zapisywania wyników.
- Możliwość eksportu wyników do `PDF` lub `CSV`.
- Dodanie kont użytkowników i trwałego przechowywania datasetów.
- Rozbudowa dokumentacji i trybu tutorialowego w aplikacji.
- Dodanie testów automatycznych i dalsze ulepszanie walidacji danych wejściowych.
