# Functional requirements:


Display
- default image background
- show existing TODOs on top using unordered list, show deadline if available
- show done TODOs behind valid TODOs, with line-through text decoration
- boxes on every item in the list: check box for exisitng TODOs and delete for done TODOs

Create TODO
- button to create new TODO
- bar to enter text
- optional: datetime selection
- default guiding message

Clear
- after created, a box should appear on the right side of the box;
- clicking the box results in clearing this item, add a line-through text decoration, move behind the other uncleared TODOs
- the check box is then converted into a delete button

Delete TODO
- on clicking the delete button, the whole item will be removed.