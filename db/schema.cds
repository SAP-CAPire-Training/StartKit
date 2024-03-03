namespace report.incident;

entity MasterData {
    key ID   : Integer;
        name : String;
        type : String;
}

entity Incident {
    key ID                        : Integer;
        reported_by               : String(255);
        title_role                : String(255);
        date_of_report            : Date;
        incident_type             : String(255);
        date_of_incident          : Date;
        city                      : String(255);
        state                     : String(255);
        zip_code                  : String(255);
        specific_area_of_location : String(255);
        incident_description      : String;
        location                  : String(255);
        police_report_filed       : Boolean;
        follow_up_action          : String;
        precinct                  : String(255);
        reporting_officer         : String(255);
        phone                     : String(255);
        involved                  : Composition of many Party_involved
                                        on involved.incident = $self;
        witnesses                 : Composition of many Witness
                                        on witnesses.incident = $self;
}

entity Party_involved {
    key ID       : Integer;
        name     : String(255);
        role     : String(255);
        contact  : String(255);
        incident : Association to Incident;
}

entity Witness {
    key ID       : Integer;
        name     : String(255);
        role     : String(255);
        contact  : String(255);
        incident : Association to Incident;
}
