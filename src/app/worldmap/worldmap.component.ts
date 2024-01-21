import { Component } from '@angular/core';

@Component({
  selector: 'app-worldmap',
  templateUrl: './worldmap.component.html',
  styleUrl: './worldmap.component.scss'
})
export class WorldMapComponent {
  private currentCountry: SVGPathElement | null = null;

  onMouseOver(event: MouseEvent): void {
    const elementMouseIsOver = document.elementFromPoint(event.clientX, event.clientY);

    if (elementMouseIsOver instanceof SVGPathElement) {
      if (this.currentCountry !== elementMouseIsOver) {
        this.revertColor();
        this.currentCountry = elementMouseIsOver;
        this.currentCountry.style.fill = 'orange';
        console.log(this.currentCountry.id);
        const countryId = this.currentCountry.id;
        this.apiCall(countryId);
      }
    }
  }

  onMouseLeave(): void {
    this.revertColor();
    this.currentCountry = null;
  }

  private revertColor(): void {
    if (this.currentCountry) {
      this.currentCountry.style.fill = 'black';
    }
  }

  private updateAsideElement(countryInfo: CountryInfo | null): void {
    const infoElement = document.getElementById('info');
    if (infoElement) {
      if (countryInfo) {
        infoElement.innerHTML = `
          <p><b>Country: </b><br>${countryInfo.id}</p>
          <p><b>Capital: </b><br>${countryInfo.capitalCity}</p>
          <p><b>Region: </b><br>${countryInfo.region.value}</p>
          <p><b>Income Level: </b><br>${countryInfo.incomeLevel.value}</p>
          <p><b>Lat: </b><br>${countryInfo.latitude}</p>
          <p><b>Long: </b><br>${countryInfo.longitude}</p>
        `;
      } else {
        // Handle the case when countryInfo is null (no country selected)
        infoElement.innerHTML = '<p>No country selected</p>';
      }
    }
  }

  private apiCall(countryId: string): void {
    const apiUrl = `https://api.worldbank.org/v2/country/${countryId}?format=json`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        // Extract relevant information from the API response
        const countryInfo = this.extractCountryInfo(data);
        console.log('Country Information:', countryInfo);

        // Update the <aside> element with the country information
        this.updateAsideElement(countryInfo);
      })
      .catch(error => {
        console.error('API Error:', error);
      });
  }

  private extractCountryInfo(apiResponse: any): CountryInfo | null {
    if (apiResponse && Array.isArray(apiResponse[1]) && apiResponse[1].length > 0) {
      const countryData = apiResponse[1][0];
      console.log(countryData);
      const countryInfo: CountryInfo = {
        id: countryData.name,
        capitalCity: countryData.capitalCity,
        region: {
          id: countryData.region.id,
          value: countryData.region.value,
        },
        incomeLevel: {
          id: countryData.incomeLevel.id,
          value: countryData.incomeLevel.value,
        },
        longitude: countryData.longitude,
        latitude: countryData.latitude,
      };
      return countryInfo;
    }
    return null;
  }
}

interface CountryInfo {
  id: string;
  capitalCity: string;
  region: {
    id: string;
    value: string;
  };
  incomeLevel: {
    id: string;
    value: string;
  };
  longitude: string;
  latitude: string;
}
