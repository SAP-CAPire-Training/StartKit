using {employee as emp} from '../db/schema';

service EmployeeInformation {
    entity Employee as projection on emp.Employee;
}
