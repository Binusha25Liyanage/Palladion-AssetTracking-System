from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdmin, IsAuthenticatedAnyRole
from apps.assets.models import Asset

from .models import MarketValuation
from .serializers import MarketValuationSerializer


class AssetValuationListCreateView(APIView):
    """GET/POST /assets/:id/valuations"""

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdmin()]
        return [IsAuthenticatedAnyRole()]

    def get(self, request, asset_id):
        valuations = MarketValuation.objects.filter(asset_id=asset_id)
        return Response(MarketValuationSerializer(valuations, many=True).data)

    def post(self, request, asset_id):
        serializer = MarketValuationSerializer(data={**request.data, "asset": asset_id})
        serializer.is_valid(raise_exception=True)
        serializer.save(estimated_by=request.user)
        return Response(serializer.data, status=201)


class AssetDepreciationView(APIView):
    permission_classes = [IsAuthenticatedAnyRole]

    def get(self, request, asset_id):
        try:
            asset = Asset.objects.get(pk=asset_id)
        except Asset.DoesNotExist:
            return Response({"detail": "Asset not found."}, status=404)
        latest_valuation = asset.valuations.first()
        return Response(
            {
                "asset_tag": asset.asset_tag,
                "purchase_value": asset.purchase_value,
                "book_value": asset.book_value,
                "latest_market_value": latest_valuation.value if latest_valuation else None,
                "useful_life_years": asset.useful_life_years,
                "purchase_date": asset.purchase_date,
            }
        )
