;; Questo programma converte il file locale 'tabella.csv' in un
;; file sql(compatibile con SQLite) filtrando
;; le colonne superflue
;; Sviluppato da Marco Cetica (c) 2022
;;
(defpackage tab_filter
  (:use :cl))
(in-package :tab_filter)

;; Crea query tabella nazioni
(defun crea-tabella-nazioni (nome-tabella campo-luogo campo-codice)
  "Genera query creazione"
  (format nil
           "CREATE TABLE ~a (~%    ~s VARCHAR(64) NOT NULL,~%    ~s VARCHAR(4) NOT NULL PRIMARY KEY~%);~%"
    nome-tabella campo-luogo campo-codice))

;; Converti una riga in una query di creazione in formato SQL
(defun query-generator (row)
  "Converti una riga in una query di creazione"
  (format nil "INSERT INTO codNazioni(City, Code) VALUES (~s, ~s);" (first row) (second row)))

(defun main ()
  (let* ((tabella (handler-case (cl-csv:read-csv #P"tabella.csv")
                    (error ()
                        (format t "Impossibile leggere il file 'tabella.csv'~%")
                        (sb-ext:quit)))) ; Leggi il file locale 'tabella.csv'
         (header-tabella (car tabella)) ; Estrai l'header della tabella
         (colonne-da-tenere '("Denominazione IT" "Codice AT")) ; Specifica quali colonne tenere
         (indici-colonne-da-tenere (mapcar
                                     (lambda (col)
                                       (position col header-tabella :test #'string=))
                                     colonne-da-tenere)) ; Estrai gli indici delle colonne da tenere
         (tabview (mapcar
                    (lambda (row)
                      (loop
                        for x in indici-colonne-da-tenere
                        collect (nth x row)))
                    tabella)) ; Filtra le colonne non necessarie della tabella
         (tabella-filtrata (remove-if (lambda (l) (string= (second l) "n.d.")) (cdr tabview))) ; Rimuovi luoghi con codice non definito
         (query-creazione (crea-tabella-nazioni "codNazioni" "City" "Code")) ; Genera la query di creazione della tabella
         (query-inserimento (mapcar #'query-generator tabella-filtrata))) ; Genera le query di inserimento
    (with-open-file (stream "./codnazioni.sql"
                         :direction :output
                         :if-exists :supersede
                         :if-does-not-exist :create)
      (format stream "/* Schema tabella generato automaticamente ~% * ~(~a~)~% * Non modificare */~%" (local-time:now)) ; Aggiungi data generazione
      (format stream "~a~%" query-creazione) ; Scrivi la query di creazione della tabella
      (loop for row in query-inserimento
            do (format stream "~a~%" row)))) ; Scrivi le query di inserimento
  (format t "File csv convertito correttamente.~%"))
