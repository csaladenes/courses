let
    Source = Excel.Workbook(File.Contents("E:\OneDrive\Downloads\B2B Governance March'25- Data for dashboard.xlsx"), null, true),
    Support_Sheet = Source{[Item="Support",Kind="Sheet"]}[Data],
    #"Changed Type" = Table.TransformColumnTypes(Support_Sheet,{{"Column1", type text}, {"Column2", type text}, {"Column3", type text}, {"Column4", type text}, {"Column5", type any}, {"Column6", type any}, {"Column7", type any}, {"Column8", type any}, {"Column9", type any}, {"Column10", type any}, {"Column11", type any}, {"Column12", type any}, {"Column13", type any}, {"Column14", type text}, {"Column15", type text}, {"Column16", type text}, {"Column17", type text}}),
    #"Removed Top Rows" = Table.Skip(#"Changed Type",3),
    #"Promoted Headers" = Table.PromoteHeaders(#"Removed Top Rows", [PromoteAllScalars=true]),
    #"Changed Type1" = Table.TransformColumnTypes(#"Promoted Headers",{{"Portfolio", type text}, {"App / Product Name", type text}, {"Owner", type text}, {"Month (2025)", type text}, {"Total Incidents", type any}, {"Number of major incidents (P1 & P2)", Int64.Type}, {"Number of Aged Incidents (Over 30 days)", Int64.Type}, {"Tasks Received", type any}, {"Open Tasks", Int64.Type}, {"Completed Tasks", type any}, {"Aged Tasks (Over 30 days)", Int64.Type}, {"Enhancement Requests", type any}, {"Completed Enhancements", type any}, {"Enhancement Backlog", type text}, {"Aged Enhancements in Backlog (Over 30 days)", type text}, {"Number of improvements", type text}, {"Comment on the improvement", type text}}),
    #"Unpivoted Columns" = Table.UnpivotOtherColumns(#"Changed Type1", {"Portfolio", "App / Product Name", "Owner", "Month (2025)"}, "Metric", "Value"),
    #"Added MetricGroup" = Table.AddColumn(#"Unpivoted Columns", "MetricGroup", each 
        if Text.Contains([Metric], "Incident") then "Incidents"
        else if Text.Contains([Metric], "Task") then "Service Requests"
        else if Text.Contains([Metric], "Enhancement") then "Enhancements"
        else if Text.Contains([Metric], "improvement") then "Service Improvements"
        else null),
    #"Replaced Values" = Table.ReplaceValue(#"Added MetricGroup", "NA", null, Replacer.ReplaceValue, {"Value"}),
    #"Replaced Values 2" = Table.ReplaceValue(#"Replaced Values", "NA ", null, Replacer.ReplaceValue, {"Value"}),
    #"Replaced Values 3" = Table.ReplaceValue(#"Replaced Values 2", "NA (As of now story points are not aplicable will bring into practice from next sprint)", null, Replacer.ReplaceValue, {"Value"}),
    #"Replaced Values 4" = Table.ReplaceValue(#"Replaced Values 3", "Nil", null, Replacer.ReplaceValue, {"Value"})
in
    #"Replaced Values 4"

NA 