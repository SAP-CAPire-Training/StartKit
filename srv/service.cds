using {report.incident as my} from '../db/schema';

service ReportIncident @(path: '/browse') {

    entity Incident      as projection on my.Incident;
    entity PartyInvolved as projection on my.Party_involved;
    entity Witnesses     as projection on my.Witness;

    @readonly
    entity MasterData    as projection on my.MasterData;
}
