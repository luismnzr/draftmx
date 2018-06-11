// BEGIN TransfersApi
const AIRTABLE_ID = "apprDoWASyBozxB03";
const AIRTABLE_API_KEY = "keynU2NCMASbzLS8m";
const BASE_URL =
  "https://api.airtable.com/v0/" + AIRTABLE_ID + "/Table%201?filterByFormula=";

class TransfersApi {
  static fetchTransfers(filterByFormula) {
    return fetch(BASE_URL + filterByFormula, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`
      }
    })
      .then(this.json)
      .then(data => {
        return this.convertDataToTransfers(data);
        console.log("Request succeeded with JSON response", data);
      })
      .catch(function(error) {
        console.log("Request failed", error);
      });
  }

  static convertDataToTransfers(data) {
    return data.records.map(record => {
      return this.convertRecordToTransfer(record);
    });
  }

  static convertRecordToTransfer(record) {
    const fields = record.fields;
    return {
      typeIcon: fields["Type Icon"],
      type: fields["Type"], // Rumor, Oficial
      player: {
        name: fields["Name"],
        fullName: fields["Full Name"],
        age: fields["Age"],
        height: fields["Height"],
        foot: fields["Foot"],
        country: fields["Country"],
        position: fields["Position"]
      },
      teamA: {
        imageUrl: this.getTeamImage("Team A", fields),
        name: fields["Team A Label"]
      },
      teamB: {
        imageUrl: this.getTeamImage("Team B", fields),
        name: fields["Team B Label"]
      }
    };
  }

  static json(response) {
    return response.json();
  }

  static getTeamImage(teamName, fields) {
    if (fields[`${teamName} Image`] && fields[`${teamName} Image`][0]) {
      return fields[`${teamName} Image`][0].url;
    }
  }
}
// END TransfersApi

// BEGIN transfer markup
// transferData = { name, team_a, team_b }
const getTransferMarkup = transfer => {
  return `<article data-type="${transfer.type}" data-team-A="${
    transfer.teamA.name
  }"  data-team-B="${transfer.teamB.name}"  class="transfers__grid-card">
    <p>${transfer.typeIcon} ${transfer.type}</p>
    <div class="transfers__grid-cardTeams">
      <img class="transfers__grid-cardTeamA" src="${
        transfer.teamA.imageUrl
      }" alt="">
      <img class="transfers__grid-cardTeamicon" src="../images/transfer-icon.svg" alt="">
      <img class="transfers__grid-cardTeamB" src="${
        transfer.teamB.imageUrl
      }" alt="">
    </div>
    <h5 class="transfers__grid-cardPlayer">${transfer.player.name}</h5>
    <p class="transfers__grid-cardPosition">${transfer.player.position}</p>
  </article>`;
};
// END transfer markup

const loadTransfers = (filterByFormula = "") => {
  TransfersApi.fetchTransfers(filterByFormula).then(transfers => {
    $("section.transfers__grid").html("");
    transfers.forEach(transfer => {
      $("section.transfers__grid").append(getTransferMarkup(transfer));
    });

    // Bind on click action to expand article.
  });
};

// BEGIN FilterService
class FilterService {
  constructor() {
    this.currentTeam = null;
    this.currentType = null;
  }

  filterByTeam(value) {
    this.currentTeam = value;
    this.filter();
  }

  clearFilterTeam(value) {
    this.currentTeam = value;
    this.filter();
  }

  clearFilterType() {
    this.currentType = null;
    this.filter();
  }

  filterByType(value) {
    this.currentType = value;
    this.filter();
  }

  filter() {
    loadTransfers(this.getFilterByFormula());
  }

  getFilterByFormula() {
    const filters = [];
    if (this.currentType) {
      filters.push(`{Type}="${this.currentType}"`);
    }

    if (this.currentTeam) {
      filters.push(
        `OR({Team A Label}="${this.currentTeam}",{Team B Label}="${
          this.currentTeam
        }")`
      );
    }

    if (filters.length > 0) {
      return `AND(${filters.join(",")})`;
    }

    return "";
  }
}
// END

loadTransfers();

filterService = new FilterService();

// Binding of types on click
$(".filter-by-type").each(index => {
  const filterContainer = $($(".filter-by-type")[index]);
  filterContainer.click(() => {
    const value = filterContainer.data("filter-by-type");

    if (value == "all") {
      filterService.clearFilterType();
    } else {
      filterService.filterByType(value);
    }
  });
});

$(".filter-by-team").each(index => {
  const filterContainer = $($(".filter-by-team")[index]);
  filterContainer.click(() => {
    const value = filterContainer.data("filter-by-team");

    if (value == "all") {
      filterService.clearFilterTeam();
    } else {
      filterService.filterByTeam(value);
    }
  });
});
