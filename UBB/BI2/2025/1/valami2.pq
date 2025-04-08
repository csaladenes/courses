let
    Source = Excel.Workbook(File.Contents("E:\OneDrive\Downloads\B2B Governance March'25- Data for dashboard.xlsx"), null, true),
    Performance_Sheet = Source{[Item="Performance",Kind="Sheet"]}[Data],
    #"Changed Type" = Table.TransformColumnTypes(Performance_Sheet,{{"Column1", type text}, {"Column2", type text}, {"Column3", type text}, {"Column4", type text}, {"Column5", type any}, {"Column6", type any}, {"Column7", type any}, {"Column8", type any}, {"Column9", type any}, {"Column10", type any}, {"Column11", type any}}),
    #"Removed Top Rows" = Table.Skip(#"Changed Type",3),
    #"Promoted Headers" = Table.PromoteHeaders(#"Removed Top Rows", [PromoteAllScalars=true]),
    #"Changed Type1" = Table.TransformColumnTypes(#"Promoted Headers",{
        {"Portfolio", type text}, 
        {"App / Product Name", type text}, 
        {"Owner", type text}, 
        {"Month (2025)", type text}, 
        {"% of Committed Product Backlog Item (PBI's) (Ready) vs Delivered (Done)", type number},
        {"% of Story Points (SP's/Efforts) planned vs number of stories delivered", type number},
        {"Successful CI Changes (%)", type number},
        {"Number of Priority3 and Priority4 Incidents caused by CI Changes", Int64.Type},
        {"Automated test coverage (%)", type number},
        {"Number of AI based productivity improvement proposals", Int64.Type},
        {"Number of AI based productivity improvement tests", Int64.Type},
        {"Number of AI productivity improvement moved to flight", Int64.Type},
        {"Estimated value of productivity improvements ($)", type number}
    }),
    #"Unpivoted Columns" = Table.UnpivotOtherColumns(#"Changed Type1", {"Portfolio", "App / Product Name", "Owner", "Month (2025)"}, "Metric", "Value"),
    #"Added MetricGroup" = Table.AddColumn(#"Unpivoted Columns", "MetricGroup", each 
        if Text.Contains([Metric], "PBI") or Text.Contains([Metric], "Story Points") then "Velocity"
        else if Text.Contains([Metric], "CI Changes") or Text.Contains([Metric], "test coverage") then "Quality"
        else if Text.Contains([Metric], "AI") or Text.Contains([Metric], "productivity") then "AI based productivity improvements"
        else null),
    #"Replaced Values" = Table.ReplaceValue(#"Added MetricGroup", "NA", null, Replacer.ReplaceValue, {"Value"}),
    #"Replaced Values 2" = Table.ReplaceValue(#"Replaced Values", "NA ", null, Replacer.ReplaceValue, {"Value"}),
    #"Replaced Values 3" = Table.ReplaceValue(#"Replaced Values 2", "NA (As of now story points are not aplicable will bring into practice from next sprint)", null, Replacer.ReplaceValue, {"Value"}),
    #"Replaced Values 4" = Table.ReplaceValue(#"Replaced Values 3", "Nil", null, Replacer.ReplaceValue, {"Value"})
in
    #"Replaced Values 4" 