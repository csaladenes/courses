class PeopleExpressSim {
    constructor(maxQuarters = 20) {
        this.maxQuarters = maxQuarters;
        this.reset();
    }

    reset() {
        // Initial State (Year 1 Quarter 1) based on Case Study
        this.quarter = 0;
        
        // Stocks
        this.fleet = 3; 
        this.staff = 50; 
        this.reputation = 1.0; 
        this.cash = 5000000; 
        this.debt = 2000000; 
        
        // Parameters (Calibrated to Case Study)
        this.seatsPerPlane = 120;
        this.avgFlightDistance = 500; 
        this.flightsPerQuarterPerPlane = 90; 
        
        this.quarterlyPlaneCost = 500000; 
        this.quarterlyStaffCost = 15000; 
        this.marketingEffectiveness = 0.5; 
        this.hiringCost = 2000;
        this.planePurchaseCost = 2000000; 

        // Demand Params
        this.marketSize = 200000; 
        this.referencePrice = 0.16; // Competitor Base Fare ($/mile)
        this.priceSensitivity = 2.0; 

        // Service Quality Params
        this.optimalStaffPerPassenger = 0.002; 
        this.reputationDelay = 0.5; 

        // Decisions (Inputs) - Initial "Take-off" strategy
        this.price = 0.09; // Start at $0.09/mile (Low Cost)
        this.marketingSpend = 50000;
        this.targetHiring = 5;
        this.planeOrders = 0;
        this.serviceScope = 0.60; // Start at 0.6 (No Frills)
        this.competitorPrice = 0.16; // Start at $0.16/mile

        // History for charting AND State Restoration
        this.history = [];
        
        // Store full state snapshots for time travel
        this.snapshots = [];
        
        this.logState();
    }

    // Capture a full snapshot of the current state
    createSnapshot() {
        return {
            quarter: this.quarter,
            fleet: this.fleet,
            staff: this.staff,
            reputation: this.reputation,
            cash: this.cash,
            debt: this.debt,
            price: this.price,
            marketingSpend: this.marketingSpend,
            targetHiring: this.targetHiring,
            planeOrders: this.planeOrders,
            serviceScope: this.serviceScope, // Added
            competitorPrice: this.competitorPrice
        };
    }

    // Restore state from a snapshot
    restoreSnapshot(snapshot) {
        this.quarter = snapshot.quarter;
        this.fleet = snapshot.fleet;
        this.staff = snapshot.staff;
        this.reputation = snapshot.reputation;
        this.cash = snapshot.cash;
        this.debt = snapshot.debt || 0;
        this.price = snapshot.price;
        this.marketingSpend = snapshot.marketingSpend;
        this.targetHiring = snapshot.targetHiring;
        this.planeOrders = snapshot.planeOrders;
        this.serviceScope = snapshot.serviceScope || 0.6; // Added
        this.competitorPrice = snapshot.competitorPrice || 0.16;
    }

    stepBack() {
        if (this.quarter > 0) {
            this.history.pop(); 
            this.snapshots.pop(); 
            const lastSnapshot = this.snapshots[this.snapshots.length - 1];
            this.restoreSnapshot(lastSnapshot);
            return this.history[this.history.length - 1];
        }
        return null;
    }

    // Main Simulation Step (Quarter)
    tick(decisions) {
        // 1. Apply Decisions
        this.price = Math.max(0.05, decisions.price); // Floor at 0.05
        this.marketingSpend = Math.max(0, decisions.marketingSpend);
        let hires = Math.max(-this.staff, decisions.hires);
        let planesOrdered = Math.max(0, decisions.planesOrdered);
        this.serviceScope = Math.max(0.1, Math.min(2.0, decisions.serviceScope || this.serviceScope));

        // 2. Competitor Logic (Reaction to Price AND Scope)
        // If we offer high scope at low price, they drop price harder.
        let competitivePressure = (this.referencePrice / this.price) * (this.serviceScope / 1.0);
        
        if (competitivePressure > 1.2) {
            this.competitorPrice = Math.max(0.08, this.competitorPrice * 0.95); // Fight back
        } else if (competitivePressure < 0.8) {
            this.competitorPrice = Math.min(0.25, this.competitorPrice * 1.02); // Relax
        }

        // 3. Calculate Capacity (Seat Miles)
        // Fleet * Seats * Flights * AvgDist
        const availableSeatMiles = this.fleet * this.seatsPerPlane * this.flightsPerQuarterPerPlane * this.avgFlightDistance;
        
        // 4. Calculate Demand (Revenue Passenger Miles - RPM)
        const priceRatio = this.price / this.competitorPrice;
        const scopeFactor = Math.pow(this.serviceScope, 0.5); // Higher scope attracts more, but diminishing returns
        const priceFactor = Math.max(0, 2.5 - Math.pow(priceRatio, this.priceSensitivity)); 
        const marketingFactor = 1 + (Math.log(1 + this.marketingSpend / 10000) * 0.1);
        
        // Demand in Passenger Miles
        let potentialRPM = (this.marketSize * 500) * priceFactor * this.reputation * marketingFactor * scopeFactor;
        
        // 5. Determine Actual RPM (Limited by Capacity)
        let actualRPM = Math.min(potentialRPM, availableSeatMiles);
        let loadFactor = availableSeatMiles > 0 ? actualRPM / availableSeatMiles : 0;
        let passengers = actualRPM / this.avgFlightDistance; // Back to passenger count for display

        // 6. Calculate Service Quality & Workload
        // Scope increases workload linearly. 
        // Workload = Passengers * Scope
        // Capacity = Staff / OptimalRatio
        const workload = passengers * this.serviceScope;
        const staffCapacity = this.staff / this.optimalStaffPerPassenger; // Passengers/Staff capacity
        
        let serviceRatio = staffCapacity > 0 ? staffCapacity / workload : 1.2; 
        
        // Quality drops if ratio < 1
        let serviceQuality = Math.min(1.2, serviceRatio);
        if (serviceRatio < 1) {
            serviceQuality = Math.pow(serviceRatio, 2); 
        }

        // Advanced Metrics
        let workweek = 40;
        if (serviceRatio < 1) {
            workweek = 40 + (40 * (1 - serviceRatio)); 
            workweek = Math.min(60, workweek);
        }

        const productivity = this.staff > 0 ? actualRPM / this.staff : 0;

        // 7. Update Reputation
        this.reputation = this.reputation + this.reputationDelay * (serviceQuality - this.reputation);

        // 8. Financials
        // Revenue = RPM * Price/Mile
        const revenue = actualRPM * this.price;
        
        const staffCosts = this.staff * this.quarterlyStaffCost;
        const fleetCosts = this.fleet * this.quarterlyPlaneCost; 
        const hiringCosts = Math.abs(hires) * this.hiringCost;
        const debtInterest = this.debt * 0.02; 
        
        // Scope increases cost per passenger (meals, bags etc)
        const serviceVariableCost = passengers * 10 * this.serviceScope; // $10 base cost scaled by scope

        const totalCosts = staffCosts + fleetCosts + hiringCosts + this.marketingSpend + debtInterest + serviceVariableCost; 
        
        const downPayment = planesOrdered * 500000; 
        const newLoan = planesOrdered * 1500000; 
        this.debt += newLoan; 

        const opProfit = revenue - totalCosts;
        const netIncome = opProfit; // Simplified tax

        this.cash = this.cash + netIncome - downPayment;

        // Balance Sheet
        const fleetValue = this.fleet * 2000000; 
        const totalAssets = this.cash + fleetValue;
        const equity = totalAssets - this.debt;

        // 9. Update Stocks
        this.staff += hires;
        this.fleet += planesOrdered;
        this.quarter++;

        // 10. Log
        const state = {
            quarter: this.quarter,
            cash: this.cash,
            profit: netIncome,
            revenue: revenue,
            expenses: totalCosts,
            passengers: passengers,
            fleet: this.fleet,
            staff: this.staff,
            reputation: this.reputation,
            serviceQuality: serviceQuality,
            loadFactor: loadFactor,
            
            assets: totalAssets,
            debt: this.debt,
            equity: equity,
            workweek: workweek,
            productivity: productivity,
            competitorPrice: this.competitorPrice,
            price: this.price,
            serviceScope: this.serviceScope,
            capacity: availableSeatMiles
        };
        this.history.push(state);
        this.snapshots.push(this.createSnapshot());

        return state;
    }

    logState() {
        const fleetValue = this.fleet * 2000000; 
        const totalAssets = this.cash + fleetValue;
        const equity = totalAssets - this.debt;

        this.history.push({
            quarter: this.quarter,
            cash: this.cash,
            profit: 0,
            revenue: 0,
            expenses: 0,
            passengers: 0,
            fleet: this.fleet,
            staff: this.staff,
            reputation: this.reputation,
            serviceQuality: 1,
            loadFactor: 0,
            
            assets: totalAssets,
            debt: this.debt,
            equity: equity,
            workweek: 40,
            productivity: 0,
            competitorPrice: 0.16,
            price: 0.09,
            serviceScope: 0.6,
            capacity: this.fleet * 120 * 90 * 500
        });
        this.snapshots.push(this.createSnapshot());
    }

    getHistory() {
        return this.history;
    }
}
