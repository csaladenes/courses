class PeopleExpressSim {
    constructor(maxQuarters = 20) {
        this.maxQuarters = maxQuarters;
        this.reset();
    }

    reset() {
        // Initial State (Year 1 Quarter 1)
        this.quarter = 0;
        
        // Stocks
        this.fleet = 3; // Starting planes
        this.staff = 50; // Starting staff
        this.reputation = 1.0; // 100% reputation
        this.cash = 5000000; // $5M starting capital
        this.debt = 2000000; // Initial debt (loan for planes)
        
        // Parameters (Constants)
        this.seatsPerPlane = 120;
        this.avgFlightDistance = 500; // Miles per flight (avg)
        this.flightsPerQuarterPerPlane = 90; // 1 flight/day approx
        
        this.quarterlyPlaneCost = 500000; // Lease/Maintenance per plane
        this.quarterlyStaffCost = 15000; // Salary per employee
        this.marketingEffectiveness = 0.5; 
        this.hiringCost = 2000;
        this.planePurchaseCost = 2000000; // Down payment for leasing/new routes setup

        // Demand Params
        this.marketSize = 200000; // Potential quarterly passengers in region
        this.referencePrice = 100; // Competitor price (base)
        this.priceSensitivity = 2.0; // How much price affects demand

        // Service Quality Params
        this.optimalStaffPerPassenger = 0.002; // 1 staff per 500 passengers
        this.reputationDelay = 0.5; // Smoothing factor (0-1), lower is slower adaptation

        // Decisions (Inputs)
        this.price = 60;
        this.marketingSpend = 50000;
        this.targetHiring = 5;
        this.planeOrders = 0;
        this.competitorPrice = 100; // Dynamic competitor price

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
        this.competitorPrice = snapshot.competitorPrice || 100;
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
        this.price = Math.max(10, decisions.price);
        this.marketingSpend = Math.max(0, decisions.marketingSpend);
        let hires = Math.max(-this.staff, decisions.hires); // Can fire, but not more than have
        let planesOrdered = Math.max(0, decisions.planesOrdered);

        // 2. Competitor Logic (Simple Reaction)
        // If we are significantly cheaper, they drop price slightly to compete
        if (this.price < this.competitorPrice * 0.8) {
            this.competitorPrice = Math.max(50, this.competitorPrice * 0.95);
        } else if (this.price > this.competitorPrice * 1.1) {
            this.competitorPrice = Math.min(150, this.competitorPrice * 1.02);
        }

        // 3. Calculate Capacity
        const seatCapacity = this.fleet * this.seatsPerPlane * this.flightsPerQuarterPerPlane;
        
        // 4. Calculate Demand
        const priceRatio = this.price / this.competitorPrice;
        const priceFactor = Math.max(0, 2 - Math.pow(priceRatio, this.priceSensitivity)); 
        const marketingFactor = 1 + (Math.log(1 + this.marketingSpend / 10000) * 0.1);
        
        let potentialDemand = this.marketSize * priceFactor * this.reputation * marketingFactor;
        
        // 5. Determine Actual Passengers
        let passengers = Math.min(potentialDemand, seatCapacity);
        let loadFactor = seatCapacity > 0 ? passengers / seatCapacity : 0;

        // 6. Calculate Service Quality & Workload
        const neededStaff = passengers * this.optimalStaffPerPassenger;
        let serviceRatio = neededStaff > 0 ? this.staff / neededStaff : 1.2; // >1 is good
        
        let serviceQuality = Math.min(1.2, serviceRatio);
        if (serviceRatio < 1) {
            serviceQuality = Math.pow(serviceRatio, 2); 
        }

        // Advanced Metrics: Workweek & Productivity
        // Normal workweek 40h. If understaffed (ratio < 1), workweek goes up.
        // Cap at 60h (exhaustion).
        let workweek = 40;
        if (serviceRatio < 1) {
            workweek = 40 + (40 * (1 - serviceRatio)); 
            workweek = Math.min(60, workweek);
        }

        // Productivity: Revenue Miles per Employee
        // Miles = Passengers * AvgDist
        const totalRevenueMiles = passengers * this.avgFlightDistance;
        const productivity = this.staff > 0 ? totalRevenueMiles / this.staff : 0;

        // 7. Update Reputation (Stock)
        this.reputation = this.reputation + this.reputationDelay * (serviceQuality - this.reputation);

        // 8. Financials
        const revenue = passengers * this.price;
        
        const staffCosts = this.staff * this.quarterlyStaffCost;
        const fleetCosts = this.fleet * this.quarterlyPlaneCost; // Leasing + Maintenance
        const hiringCosts = Math.abs(hires) * this.hiringCost;
        const debtInterest = this.debt * 0.02; // 2% quarterly interest
        
        const totalCosts = staffCosts + fleetCosts + hiringCosts + this.marketingSpend + debtInterest + (planesOrdered * this.planePurchaseCost * 0.1); 
        
        // Adjustment: Buying a plane increases Assets and Debt.
        // Down payment comes from Cash.
        const downPayment = planesOrdered * 500000; 
        const newLoan = planesOrdered * 1500000; // Rest of the 2M cost
        this.debt += newLoan; 

        const opProfit = revenue - (staffCosts + fleetCosts + hiringCosts + this.marketingSpend);
        const netIncome = opProfit - debtInterest;

        this.cash = this.cash + netIncome - downPayment;

        // Balance Sheet approximate
        // Assets = Cash + Fleet Value (depreciated? let's say fixed value per plane for simplicity)
        const fleetValue = this.fleet * 2000000; 
        const totalAssets = this.cash + fleetValue;
        const equity = totalAssets - this.debt;

        // 9. Update Stocks for next round
        this.staff += hires;
        this.fleet += planesOrdered;
        this.quarter++;

        // 10. Log State
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
            
            // Advanced
            assets: totalAssets,
            debt: this.debt,
            equity: equity,
            workweek: workweek,
            productivity: productivity,
            competitorPrice: this.competitorPrice,
            price: this.price, // Added price here
            capacity: seatCapacity
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
            competitorPrice: 100,
            price: this.price, // Added price here
            capacity: this.fleet * 120 * 90
        });
        this.snapshots.push(this.createSnapshot());
    }

    getHistory() {
        return this.history;
    }
}
