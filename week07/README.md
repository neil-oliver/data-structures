# Week 07 Task
Task instructions provided by [Aaron Hill](https://github.com/aaronxhill).

Full instructions for this tasks can be found on the Parsons MSDV [Data Structures GitHub Page](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_07.md).

This task was completed including a detailed writeup during the [Week 4](https://github.com/neil-oliver/data-structures/tree/master/week03) [Weekly Data Structures Tasks](https://github.com/neil-oliver/data-structures).
A few amendments were suggested during that stage, so these will be addressed and discussed in this weeks code and README.

## Suggested amendments from previous task
- The code was cleaned to a good level, with the only remaining issues being a very small amount of missing information. This could be rectified in some cases using the TAMU response data to replace insistent data or fill in missing gaps such as zip codes.

- The start and end fields could be time datatype but would not currently accept current JSON value. This should be updated for better searching through the GUI.  
    - This was fixed during the implementation of the postgreSQL query in [Task 6](https://github.com/neil-oliver/data-structures/tree/master/week06).

- While the nested loop approach works for such a small number of nested objects, a recursive function may have been a more efficient way of coding the solution.