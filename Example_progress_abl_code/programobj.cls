/* 
** Class: Person
** Description: A class to represent a person with a name and age.
*/

DEFINE CLASS Person AS PUBLIC
    /* Data members (properties) */
    PRIVATE CHARACTER name NO-UNDO.
    PRIVATE INTEGER age NO-UNDO.

    /* Constructor */
    METHOD PUBLIC CONSTRUCTOR CHARACTER cName, INTEGER iAge:
        ASSIGN
            name = cName
            age = iAge.
    END METHOD.

    /* Method to get the person's name */
    METHOD PUBLIC CHARACTER GetName():
        RETURN name.
    END METHOD.

    /* Method to set the person's name */
    METHOD PUBLIC VOID SetName(CHACTER cName):
        ASSIGN name = cName.
    END METHOD.

    /* Method to get the person's age */
    METHOD PUBLIC INTEGER GetAge():
        RETURN age.
    END METHOD.

    /* Method to set the person's age */
    METHOD PUBLIC VOID SetAge(INTEGER iAge):
        ASSIGN age = iAge.
    END METHOD.

    /* Method to display person's details */
    METHOD PUBLIC VOID DisplayPerson():
        MESSAGE "Name: " + name SKIP "Age: " + STRING(age)
            VIEW-AS ALERT-BOX.
    END METHOD.

END CLASS.
