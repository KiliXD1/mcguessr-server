# Audio-Dateien

Einfach Dateien mit genau diesen Namen hier reinlegen - der Code lädt sie
automatisch, keine Code-Änderung nötig. Format: mp3 (breiteste Browser-
Unterstützung). Fehlt eine Datei, spielt das Spiel einfach keinen Ton dafür
(kein Fehler, kein Absturz).

## music/

Eine einzige durchgehende Musik-Playlist läuft im Hintergrund - im Menü
genau wie während einer Runde. Beim Rundenstart/-ende wird nichts
umgeschaltet, der gerade laufende Track spielt einfach weiter.

| Datei                          | Wann                                                                 |
|---------------------------------|-------------------------------------------------------------------------|
| `menu.mp3` (oder `menu1.mp3` ... `menu6.mp3`) | Playlist - beliebig viele davon, spielt in zufälliger Reihenfolge, wechselt mit sanftem Crossfade zum nächsten, sobald ein Track zu Ende ist |
| `game-lowtime.mp3`                | Kurze "Warnung": legt sich einmalig über die laufende Musik, sobald die Rundenzeit knapp wird (letzte 20%) - die Musik wird dafür nur leiser (geduckt), nicht ersetzt, und danach wieder lauter |

`menu.mp3`/`menu1.mp3` bis `menu6.mp3` sind alle optional und werden alle in
denselben Topf geworfen - du kannst auch nur 1 oder 2 Dateien reinlegen, der
Rest wird einfach übersprungen. `game-lowtime.mp3` sollte kein Loop sein,
sondern ein kurzes Stück, das von selbst aufhört.

## sfx/

| Datei                | Wann                                                    |
|-----------------------|----------------------------------------------------------|
| `click.mp3`             | Bei jedem Button-Klick                                    |
| `result.mp3`            | Wenn man seinen Guess abgibt (Punktzahl der Runde erscheint) |
| `impact.mp3`            | Wenn man in eine Runde geht (neuer Screenshot erscheint)  |

Lautstärke für Musik und Effekte ist getrennt im Spiel einstellbar (Zahnrad-
Icon unten links) und wird pro Browser gespeichert.
