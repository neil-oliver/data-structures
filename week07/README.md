# Week 07 Task
Task instructions provided by [Aaron Hill](https://github.com/aaronxhill).

Full instructions for this tasks can be found on the Parsons MSDV [Data Structures GitHub Page](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_07.md).

This task was completed including a detailed writeup during the [Week 4](https://github.com/neil-oliver/data-structures/tree/master/week03) [Weekly Data Structures Tasks](https://github.com/neil-oliver/data-structures).
A few amendments were suggested during that stage, so these will be addressed and discussed in this weeks code and README.

## Suggested amendments from previous task
- **The code was cleaned to a good level, with the only remaining issues being a very small amount of missing information. This could be rectified in some cases using the TAMU response data to replace insistent data or fill in missing gaps such as zip codes.**

Incorrect initial assessment as TAMU response. While TAMU does respond with an address, it is simply the input address formatted slightly differently (in capitals). 
To validate and retify addresses with missing information, an additional serivice such as the [USPS Web Tools API](https://www.usps.com/business/web-tools-apis/#api) could be used.

To deduct if this step was needed a ```less-than-perfect.csv``` file was created which only listed the addresses with a less than 100% match score. While there are 60 addresses with a less than perfect score, **all addresses are legible, have extracted all original data contained in the AA webpage, and have successfully been geocoded.**
I therefore decided that the additional validation and cleaning step was not required and would offer no large benfit to the overall final project.

- **The start and end fields could be time datatype but would not currently accept current JSON value. This should be updated for better searching through the GUI.** 

This was fixed during the implementation of the postgreSQL query in [Task 6](https://github.com/neil-oliver/data-structures/tree/master/week06).

## Additional Changes

