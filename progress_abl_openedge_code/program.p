//devon testing

def var btest as log no-undo.
def variable ctest as character no-undo.

def temp-table torder where 
field id as character
field ord-num as char 
field bo-num as int 
.

message "DTE-debug".

if btest then
do:
    torder.id
end.


/* 
** Procedure to test the Person class.
*/

DEFINE VARIABLE myPerson AS class NO-UNDO.
DEFINE VARIABLE cName AS CHARACTER NO-UNDO.
DEFINE VARIABLE iAge AS INTEGER NO-UNDO.

/* Create an instance of the Person class */
CREATE PERSON myPerson.
myPerson:CONSTRUCTOR("John Doe", 30).

/* Display the person's details */
myPerson:DISPLAYPERSON().

/* Modify the person's name and age */
myPerson:SetName("Jane Doe").
myPerson:SetAge(28).

/* Display the updated details */
myPerson:DISPLAYPERSON().

/* Clean up */
DELETE OBJECT myPerson.

procedure thisThing:

    // just testing a go to definition
end procedure.

temp-table tcustomer where 
    field id as int 
    field custnumber as char 
    field company as char
    . 

run thisThing.