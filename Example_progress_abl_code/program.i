/* 
** Include file: tempTable.i
** Description: Defines a temporary table and procedures to work with it.
*/

/* Define a temp-table */
DEFINE TEMP-TABLE ttPerson NO-UNDO
    FIELD Name AS CHARACTER
    FIELD Age AS INTEGER.

/* Procedure to add a record to the temp-table */
PROCEDURE AddPerson:
    DEFINE INPUT PARAMETER cName AS CHARACTER NO-UNDO.
    DEFINE INPUT PARAMETER iAge AS INTEGER NO-UNDO.

    CREATE ttPerson.
    ASSIGN
        ttPerson.Name = cName
        ttPerson.Age = iAge.
END PROCEDURE.

/* Procedure to display all records in the temp-table */
PROCEDURE DisplayPeople:
    DEFINE VARIABLE iCount AS INTEGER NO-UNDO.

    FOR EACH ttPerson:
        DISPLAY ttPerson.Name ttPerson.Age WITH FRAME f1.
        iCount = iCount + 1.
    END.

    IF iCount = 0 THEN
        MESSAGE "No records found." VIEW-AS ALERT-BOX.
END PROCEDURE.
